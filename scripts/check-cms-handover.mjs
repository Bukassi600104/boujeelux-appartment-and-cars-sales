// Controlled operator verification. No seeds, account resets, messages or new listings.
// Each changed real record is restored from its exact private AND public snapshots.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicProjection} from '../shared-cms/validation.mjs';
const endpoint='https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms';
const accounts=JSON.parse(await readFile(new URL('../.cms-private/qa.json',import.meta.url),'utf8'));
const results=[];
async function call(site,action,body={},token){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,action,...body,...(token?{token}:{})}),signal:AbortSignal.timeout(30000)});return {status:response.status,body:await response.json()};}
for(const site of ['chida','boujeelux']){
 const a=accounts.find(account=>account.site===site),auth=await call(site,'login',{username:a.nextUsername,password:a.nextPassword});assert.equal(auth.status,200);assert.equal(auth.body.mustChange,false);const token=auth.body.token;
 const initial=(await call(site,'content',{},token)).body,live=(await call(site,'publicContent')).body.content;let revision=initial.revision,changed=false,targetSlug;
 const save=async content=>{const result=await call(site,'saveDraft',{revision,content},token);assert.equal(result.status,200,result.body.error);revision=result.body.revision;return result.body;};
 const publish=async slug=>{const result=await call(site,'publish',{revision,scope:'vehicle',vehicleSlug:slug,acknowledged:true},token);assert.equal(result.status,200,result.body.error);revision=result.body.revision;return result.body;};
 const draft=structuredClone(initial.content),marker='Verified CMS edit — restored immediately after this check.';
 try{
  assert.equal((await call(site==='chida'?'boujeelux':'chida','content',{},token)).status,401);
  const report=await call(site,'clickReport',{period:'monthly'},token);assert.equal(report.status,200);assert.equal(report.body.timeZone,'Africa/Lagos');assert.equal(report.body.total,report.body.points.reduce((sum,point)=>sum+(point.count??0),0));
  if(site==='chida'){
   const vehicle=draft.vehicles.find(item=>live.vehicles.some(publicItem=>publicItem.slug===item.slug));assert.ok(vehicle,'A real published vehicle is required');targetSlug=vehicle.slug;vehicle.description=marker;changed=true;await save(draft);
   assert.deepEqual((await call(site,'publicContent')).body.content,live,'Saving a private draft must not change the public website');
   assert.equal((await call(site,'publish',{revision,scope:'vehicle',vehicleSlug:vehicle.slug,acknowledged:false},token)).status,400);
   await publish(vehicle.slug);const actual=(await call(site,'publicContent')).body.content;assert.equal(actual.vehicles.find(item=>item.slug===vehicle.slug).description,marker);assert.deepEqual(actual.settings,live.settings,'Publishing a vehicle must not publish website drafts');assert.deepEqual(actual.vehicles.filter(item=>item.slug!==vehicle.slug),live.vehicles.filter(item=>item.slug!==vehicle.slug),'Other vehicles remain untouched');
   const restore=structuredClone(initial.content);restore.vehicles=restore.vehicles.map(item=>item.slug===vehicle.slug?structuredClone(live.vehicles.find(value=>value.slug===vehicle.slug)):item);await save(restore);await publish(vehicle.slug);await save(initial.content);changed=false;
  }else{
   const record=draft.records.find(item=>item.published);assert.ok(record,'A real published apartment is required');record.draft.description=marker;record.version++;changed=true;await save(draft);assert.deepEqual(publicProjection(site,(await call(site,'publicContent')).body.content).records.map(item=>item.published),live.records.map(item=>item.published));
   record.published=structuredClone(record.draft);record.version++;await save(draft);assert.equal((await call(site,'publicContent')).body.content.records.find(item=>item.id===record.id).published.description,marker);await save(initial.content);changed=false;
  }
  assert.deepEqual((await call(site,'content',{},token)).body.content,initial.content,'Exact private catalogue restored');assert.deepEqual((await call(site,'publicContent')).body.content,live,'Exact published catalogue restored');
  results.push({site,passed:['same-site authorization','period graph agrees with count','private draft stays private','explicit publication reflects edit','exact private/public content restored']});
 }finally{
  try{if(changed){if(site==='chida'&&targetSlug){const restore=structuredClone(initial.content);restore.vehicles=restore.vehicles.map(item=>item.slug===targetSlug?structuredClone(live.vehicles.find(value=>value.slug===targetSlug)):item);await save(restore);await publish(targetSlug);}await save(initial.content);}}
  finally{await call(site,'logout',{},token);}
 }
}
console.log(JSON.stringify({results,messagesSent:false,credentialsChanged:false,seeded:false},null,2));
