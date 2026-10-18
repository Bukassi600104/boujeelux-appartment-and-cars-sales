import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=process.env.SMOKE_BASE_URL||'http://localhost:5181';
const origin=new URL(base).origin;
const credentialsPath=new URL('../../.cms-private/qa.json',import.meta.url);
let cookie='';
let original=null;
const checks=[];
const defects=[];

function ok(name){checks.push(name);console.log(`PASS ${name}`);}
async function responseJson(response){return response.json().catch(()=>({}));}
async function post(action,body,{authenticated=true,expected=200}={}){
  const response=await fetch(`${base}/api/cms/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(authenticated&&cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
  const result=await responseJson(response);
  assert.equal(response.status,expected,`${action} returned ${response.status}: ${String(result.error||'unexpected response')}`);
  return {response,result};
}
async function page(path){return fetch(`${base}${path}`,{headers:cookie?{Cookie:cookie}:{}});}

try{
  const qa=JSON.parse(await readFile(credentialsPath,'utf8')).find(entry=>entry.site==='boujeelux');
  assert.ok(qa?.nextUsername&&qa?.nextPassword,'Boujeelux QA credentials are unavailable.');

  const malformed=await fetch(`${base}/api/cms/login`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:'null'});
  assert.equal(malformed.status,400);ok('non-object JSON rejected');
  const csrf=await fetch(`${base}/api/cms/login`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://invalid.example'},body:'{}'});
  assert.equal(csrf.status,403);ok('cross-origin mutation rejected');

  const login=await post('login',{username:qa.nextUsername,password:qa.nextPassword},{authenticated:false});
  assert.deepEqual(Object.keys(login.result).sort(),['mustChange','username']);
  const setCookie=login.response.headers.get('set-cookie')||'';
  assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/SameSite=Strict/i);
  cookie=setCookie.split(';',1)[0];assert.ok(cookie);ok('login token remains HttpOnly and absent from JSON');
  const session=await post('session',{});assert.equal(session.result.mustChange,false);ok('authenticated session accepted');

  const current=await post('content',{});original=structuredClone(current.result.content);let revision=current.result.revision;
  assert.ok(original&&Array.isArray(original.records));ok('original catalog captured for restoration');

  const imagePath=new URL('../public/images/bedroom.webp',import.meta.url);
  const image=await readFile(imagePath);
  const uploaded=await post('upload',{base64:image.toString('base64'),type:'image/webp',name:'qa-smoke.webp'});
  assert.match(uploaded.result.src,/^\/api\/media\/[a-f0-9-]{20,}\.webp$/i);
  const media=await page(uploaded.result.src);assert.equal(media.status,200);assert.match(media.headers.get('content-type')||'',/^image\/webp/);assert.ok((await media.arrayBuffer()).byteLength>0);ok('uploaded WebP served through public media BFF');

  const id=`qa-smoke-${Date.now()}`;const slug=id;const name='QA Smoke Apartment';
  const apartment={id,slug,name,subtitle:'Temporary automated verification.',description:'Temporary listing created solely to verify the hosted content workflow and removed immediately after the smoke test.',bedrooms:1,maxGuests:2,location:'Egbeda, Lagos',address:'QA verification address',amenities:['Workflow verified'],photos:[{src:uploaded.result.src,alt:'Temporary QA workflow photograph',illustrative:true}],rate:{amount:'100000',basis:'night',currency:'NGN'},partyRate:'',caution:'',policy:'Temporary QA listing. Do not book.',availability:'Unavailable',availabilityNote:'Temporary automated verification only.'};
  let content=structuredClone(original);content.records.push({id,version:1,draft:apartment,published:null});
  let saved=await post('save',{content,revision});content=saved.result.content;revision=saved.result.revision;
  let publicResult=(await post('publicContent',{}, {authenticated:false})).result;
  assert.equal(publicResult.content.records.some(record=>record.published?.slug===slug),false);ok('draft listing excluded from public content');

  let record=content.records.find(item=>item.id===id);record.published=structuredClone(record.draft);record.version+=1;
  saved=await post('save',{content,revision});content=saved.result.content;revision=saved.result.revision;
  publicResult=(await post('publicContent',{}, {authenticated:false})).result;
  assert.equal(publicResult.content.records.some(item=>item.published?.slug===slug),true);
  let detail=await page(`/apartments/${slug}`);assert.equal(detail.status,200);assert.match(await detail.text(),new RegExp(name));
  let sitemap=await page('/sitemap.xml');assert.equal(sitemap.status,200);assert.match(await sitemap.text(),new RegExp(`/apartments/${slug}`));ok('publish exposed detail route and sitemap entry');

  record=content.records.find(item=>item.id===id);record.draft.name='QA Smoke Apartment Updated';record.version+=1;
  saved=await post('save',{content,revision});content=saved.result.content;revision=saved.result.revision;
  publicResult=(await post('publicContent',{}, {authenticated:false})).result;
  assert.equal(publicResult.content.records.find(item=>item.id===id)?.published?.name,name);ok('draft edit did not leak before publication');
  record=content.records.find(item=>item.id===id);record.published=structuredClone(record.draft);record.version+=1;
  saved=await post('save',{content,revision});content=saved.result.content;revision=saved.result.revision;
  detail=await page(`/apartments/${slug}`);assert.match(await detail.text(),/QA Smoke Apartment Updated/);ok('published edit reached public detail');

  record=content.records.find(item=>item.id===id);record.published=null;record.version+=1;
  saved=await post('save',{content,revision});content=saved.result.content;revision=saved.result.revision;
  publicResult=(await post('publicContent',{}, {authenticated:false})).result;
  assert.equal(publicResult.content.records.some(item=>item.published?.slug===slug),false);
  sitemap=await page('/sitemap.xml');assert.doesNotMatch(await sitemap.text(),new RegExp(`/apartments/${slug}`));
  detail=await page(`/apartments/${slug}`);if(detail.status!==404){defects.push(`unpublished apartment detail returned ${detail.status}, expected 404`);console.log('FAIL unpublished apartment detail did not return HTTP 404');}else ok('unpublish removed public content, sitemap entry and route');

  const enquiry=await post('enquire',{type:'Apartment',payload:{name:'QA Smoke Test',apartment:'QA Smoke Apartment',arrival:'2027-01-10',departure:'2027-01-12',guests:'1',duration:'Daily',purpose:'Automated QA',notes:'Synthetic smoke test; no WhatsApp message was sent.'}},{authenticated:false});
  assert.equal(enquiry.result.ok,true);assert.ok(enquiry.result.id);ok('synthetic enquiry stored without external message send');
  const enquiries=await post('enquiries',{});const rows=Array.isArray(enquiries.result)?enquiries.result:enquiries.result.enquiries;assert.ok(rows.some(item=>item.id===enquiry.result.id));
  await post('status',{id:enquiry.result.id,status:'Closed'});ok('enquiry visible to CMS and closed');
}finally{
  if(original&&cookie){
    const latest=await post('content',{});
    await post('save',{content:original,revision:latest.result.revision});
    const restored=(await post('content',{})).result.content;
    assert.deepEqual(restored,original);ok('original catalog restored exactly');
  }
}

console.log(`Completed ${checks.length} hosted CMS checks without printing credentials.`);
assert.deepEqual(defects,[],defects.join('; '));
