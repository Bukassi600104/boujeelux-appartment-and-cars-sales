import test from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../shared-cms/publication.mjs').catch(()=>({}));
const car=(slug,status='published',name=slug)=>({slug,status,name,showPrice:true,priceValue:10,price:'₦10'});
const live={settings:{heroVehicleSlug:'one',heroTitle:'Live headline'},vehicles:[car('one'),car('two')]};
const draft={settings:{heroVehicleSlug:'one',heroTitle:'Draft headline'},vehicles:[car('one','published','Changed one'),car('two','published','Changed two'),car('three','draft')]};
test('scoped publication never publishes unrelated saved vehicle or website drafts',()=>{
 assert.equal(typeof api.buildCarPublication,'function');
 const one=api.buildCarPublication(draft,live,'vehicle','one');assert.deepEqual(one,{settings:live.settings,vehicles:[car('one','published','Changed one'),car('two')]});
 const website=api.buildCarPublication(draft,live,'website');assert.deepEqual(website,{settings:draft.settings,vehicles:live.vehicles});
 const all=api.buildCarPublication(draft,live,'all');assert.deepEqual(all,{settings:draft.settings,vehicles:draft.vehicles.slice(0,2)});
 assert.deepEqual(live.vehicles[0],car('one'));
});
test('repository draft save uses draft-only RPC, and publication sends only the requested saved scope',async()=>{
 const {SupabaseRepository}=await import('../shared-cms/repository.mjs');const calls=[];
 const db={rpc:async(name,args)=>{calls.push([name,args]);return {data:{authorized:true,saved:true,content:draft,published:name==='cms_publish_document_guarded'?args.p_published:live,revision:6,updated_at:'2026-10-18T12:00:00Z',published_at:null},error:null};},from(){return {select(fields){this.fields=fields;return this;},eq(){return this;},async single(){return {data:{content:draft,published:live,revision:5,updated_at:null,published_at:null},error:null};}};}};
 const repo=new SupabaseRepository(db,()=>{});const saved=await repo.save('chida',5,draft,api.buildCarPublication(draft,live,'all'),'unused','a'.repeat(64));
 assert.equal(calls[0][0],'cms_save_draft_guarded');assert.equal('p_published'in calls[0][1],false);assert.equal(saved.publication.websiteHasDraftChanges,true);
 await repo.publish('chida',5,'vehicle','one','a'.repeat(64));assert.equal(calls[1][0],'cms_publish_document_guarded');assert.deepEqual(calls[1][1].p_published,{settings:live.settings,vehicles:[car('one','published','Changed one'),car('two')]});
 await assert.rejects(()=>repo.publish('chida',3,'all',undefined,'a'.repeat(64)),e=>e.status===409);
});
test('publication rejects a missing selection or unknown scope without blocking a removed highlight',()=>{
 assert.equal(typeof api.buildCarPublication,'function');
 assert.throws(()=>api.buildCarPublication(draft,live,'vehicle','missing'),/vehicle/i);
 assert.throws(()=>api.buildCarPublication(draft,live,'unknown'),/scope/i);
 assert.deepEqual(api.buildCarPublication({...draft,vehicles:[car('one','draft'),car('two')]},live,'vehicle','one').vehicles,[car('two')]);
 assert.equal(api.buildCarPublication({...draft,settings:{heroVehicleSlug:'three'}},live,'website').settings.heroVehicleSlug,'three');
 const unpublished=api.buildCarPublication({...draft,vehicles:[car('one'),car('two','draft')]},live,'vehicle','two');assert.deepEqual(unpublished.vehicles,[car('one')]);
});
test('publication summary separates saved website and per-vehicle changes without leaking prices',()=>{
 assert.equal(typeof api.publicationSummary,'function');
 const summary=api.publicationSummary(draft,live,'2026-10-18T10:00:00Z');assert.deepEqual(summary,{hasDraftChanges:true,websiteHasDraftChanges:true,vehicleDraftSlugs:['one','two'],publishedVehicleSlugs:['one','two'],publishedAt:'2026-10-18T10:00:00Z'});
 assert.equal('content'in summary,false);assert.deepEqual(api.publicationSummary(live,live,null),{hasDraftChanges:false,websiteHasDraftChanges:false,vehicleDraftSlugs:[],publishedVehicleSlugs:['one','two'],publishedAt:null});
});
