// Operator QA only. Restores the exact catalogue read at the beginning.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const accounts=JSON.parse(await readFile(new URL('../.cms-private/qa.json',import.meta.url),'utf8'));
const sites=[{site:'chida',base:process.env.CHIDA_TEST_URL||'http://localhost:5173',login:'/api/admin/session',content:'/api/admin/content',logout:'/api/admin/session'}, {site:'boujeelux',base:process.env.BOUJEELUX_TEST_URL||'http://localhost:5180',login:'/api/cms/login',content:'/api/cms/content',logout:'/api/cms/logout'}];
const sessions=[];
const summary=[];
for(const config of sites){
 const a=accounts.find(a=>a.site===config.site);
 const request=(path,method='GET',body,cookie)=>fetch(config.base+path,{method,redirect:'manual',headers:{Origin:config.base,...(cookie?{Cookie:cookie}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 assert.equal((await request('/api/admin/metrics')).status,401,'metrics require full sign-in');
 const auth=await request(config.login,'POST',{username:a.nextUsername,password:a.nextPassword});
 assert.equal(auth.status,200,'QA full sign-in');assert.equal((await auth.json()).mustChange,false);
 const cookie=auth.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
 const full=(path,method='GET',body)=>request(path,method,body,cookie);
 const contentMethod=config.site==='chida'?'GET':'POST';
 const snapshot=await(await full(config.content,contentMethod,contentMethod==='POST'?{}:undefined)).json();
 const original=config.site==='chida'?snapshot:snapshot.content;
 assert.ok(original,'Catalogue must exist');
 sessions.push({...config,cookie,request,full,snapshot,original});
}
try{
 for(const s of sessions){
  const {site,base,full,request,original}=s;
  const foreign=sessions.find(other=>other.site!==site);
  const foreignValue=foreign.cookie.substring(foreign.cookie.indexOf('=')+1);
  const ownName=s.cookie.substring(0,s.cookie.indexOf('='));
  assert.equal((await request('/api/admin/metrics','GET',undefined,`${ownName}=${foreignValue}`)).status,401,'cross-site token cannot read metrics');
  const before=await(await full('/api/admin/metrics')).json();assert.ok(Number.isInteger(before.total));
  const slug=site==='chida'?original.vehicles.find(v=>v.status==='published').slug:original.records.find(r=>r.published).published.slug;
  assert.equal((await request('/api/chat-clicks','POST',{listingSlug:slug})).status,200,'published click recorded');
  const after=await(await full('/api/admin/metrics')).json();assert.ok(after.total>=before.total+1,'private aggregate reflects click');assert.ok(after.byListing.some(x=>x.listingSlug===slug&&x.count>0));
  assert.equal((await request('/api/chat-clicks','POST',{listingSlug:'../admin'})).status,400);
  assert.equal((await request('/api/chat-clicks','POST',{listingSlug:'qa-not-a-published-listing'})).status,404);
  assert.equal((await fetch(base+'/api/chat-clicks',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{"listingSlug":""}'})).status,403);
  assert.equal((await fetch(base+'/api/chat-clicks',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{bad'})).status,400);
  const large=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{"listingSlug":"'+'x'.repeat(1800)+'"}'));controller.close();}});
  assert.equal((await fetch(base+'/api/chat-clicks',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:large,duplex:'half'})).status,413,'actual streamed bytes bounded');
  if(site==='chida'){
   const changed=structuredClone(original);const vehicle=changed.vehicles.find(v=>v.slug===slug);vehicle.availability='Sold';vehicle.restockExpected=false;
   let r=await full(s.content,'PUT',changed);assert.equal(r.status,200);let current=await r.json();s.dirty=true;
   let html=await(await fetch(base+'/vehicles/'+slug)).text();assert.ok(html.includes('Sold'));assert.ok(html.includes('source a similar vehicle'));assert.ok(!html.includes(' · Available soon'));
   current.vehicles.find(v=>v.slug===slug).restockExpected=true;r=await full(s.content,'PUT',current);assert.equal(r.status,200);current=await r.json();html=await(await fetch(base+'/vehicles/'+slug)).text();assert.ok(html.includes('Available soon'));
   const privateAmount=current.vehicles.find(v=>v.slug===slug).priceValue;assert.ok(privateAmount>0);current.vehicles.find(v=>v.slug===slug).showPrice=false;r=await full(s.content,'PUT',current);assert.equal(r.status,200);
   const publicResponse=await fetch('https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,action:'publicContent'})});assert.equal(publicResponse.status,200);const publicVehicle=(await publicResponse.json()).content.vehicles.find(v=>v.slug===slug);assert.equal(publicVehicle.priceValue,0);assert.equal(publicVehicle.price,'Price on enquiry');
   const privateVehicle=(await(await full(s.content)).json()).vehicles.find(v=>v.slug===slug);assert.equal(privateVehicle.priceValue,privateAmount,'private price preserved');html=await(await fetch(base+'/vehicles/'+slug)).text();assert.ok(!html.includes(String(privateAmount)),'hidden amount absent from public HTML and hydration');
  }else{
   const changed=structuredClone(original);const record=changed.records.find(r=>r.published?.slug===slug);record.draft.availability='Unavailable';record.draft.availabilityNote='Release QA — this original listing is restored automatically.';record.published=structuredClone(record.draft);record.version++;
   const r=await full('/api/cms/save','POST',{revision:s.snapshot.revision,content:changed});assert.equal(r.status,200);s.dirty=true;
   const html=await(await fetch(base+'/apartments/'+slug)).text();assert.ok(html.includes('Unavailable'));assert.ok(html.includes('Release QA'));
  }
  summary.push({site,checks:['protected aggregate metrics','cross-site denial','published click reflected','malformed/unknown/oversize/origin rejection','saved stock/availability reflected publicly'],passed:true});
 }
}finally{
 for(const s of sessions){
  try{if(s.dirty){const read=await(await s.full(s.content,s.site==='chida'?'GET':'POST',s.site==='chida'?undefined:{})).json();const restored=s.site==='chida'?await s.full(s.content,'PUT',{...s.original,revision:read.revision}):await s.full('/api/cms/save','POST',{revision:read.revision,content:s.original});assert.equal(restored.status,200,'Original catalogue restore');}}
  finally{await s.full(s.logout,s.site==='chida'?'DELETE':'POST',s.site==='chida'?undefined:{});}
 }
}
console.log(JSON.stringify({summary,cataloguesRestored:true,secretsLogged:false,whatsappMessagesSent:false},null,2));
