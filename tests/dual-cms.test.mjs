import test from 'node:test';
import assert from 'node:assert/strict';
const api = await import('../shared-cms/validation.mjs').catch(() => ({}));
test('CMS credentials require a different username and password', () => {
  assert.equal(typeof api.validateRotation, 'function', 'credential rotation validator missing');
  assert.throws(() => api.validateRotation({username:'owner',password:'A long safe passphrase 123!'},'owner','old password here'), /username/i);
  assert.throws(() => api.validateRotation({username:'new-owner',password:'old password here'},'owner','old password here'), /different/i);
  assert.throws(() => api.validateRotation({username:'new-owner',password:'short'},'owner','old password here'), /15/);
  assert.throws(() => api.validateRotation({username:'new-owner',password:'😎'.repeat(25)},'owner','old password here'), /72/);
  assert.deepEqual(api.validateRotation({username:' New-Owner ',password:'A long safe passphrase 123!'},'owner','old password here'), {username:'new-owner',password:'A long safe passphrase 123!'});
});
test('apartment public projection never includes drafts or unpublished records', () => {
  assert.equal(typeof api.publicProjection, 'function', 'public projection missing');
  const out=api.publicProjection('boujeelux',{records:[{id:'a',version:2,draft:{name:'Secret'},published:{name:'Public'}},{id:'b',version:1,draft:{name:'Private'},published:null}]});
  assert.deepEqual(out,{records:[{id:'a',version:2,draft:{name:'Public'},published:{name:'Public'}}]});
});
test('car public projection removes archived and draft cars', () => {
  assert.equal(typeof api.publicProjection, 'function');
  assert.deepEqual(api.publicProjection('chida',{settings:{x:1},vehicles:[{slug:'a',status:'published'},{slug:'b',status:'draft'},{slug:'c',status:'archived'}]}),{settings:{x:1},vehicles:[{slug:'a',status:'published'}]});
});
test('upload validates actual file signature, size and rejects active content', () => {
  assert.equal(typeof api.decodeMedia, 'function');
  assert.throws(()=>api.decodeMedia({type:'image/svg+xml',base64:btoa('<svg/>'),name:'bad.svg'}),/supported/i);
  assert.throws(()=>api.decodeMedia({type:'image/jpeg',base64:btoa('<script>evil</script>'),name:'bad.jpg'}),/match/i);
  const out=api.decodeMedia({type:'image/png',base64:btoa(String.fromCharCode(137,80,78,71,13,10,26,10,0)),name:'sample.png'});
  assert.equal(out.ext,'png');assert.equal(out.bytes.length,9);
});
test('site and setup scopes cannot be used for dashboard operations',async()=>{
  const core=await import('../shared-cms/core.mjs').catch(()=>({}));
  assert.equal(typeof core.authorizeSession,'function','server authorization missing');
  const repo={session:async()=>({site:'chida',scope:'setup',expires_at:new Date(Date.now()+600000).toISOString(),last_seen:new Date().toISOString(),account:{site:'chida',state:'active',must_change:true,username:'owner',user_id:'a'}})};
  await assert.rejects(()=>core.authorizeSession(repo,'boujeelux','a'.repeat(43)),/sign in/i);
  await assert.rejects(()=>core.authorizeSession(repo,'chida','a'.repeat(43)),/change/i);
  assert.equal((await core.authorizeSession(repo,'chida','a'.repeat(43),true)).account.username,'owner');
});

test('request body limit is enforced in UTF-8 bytes without relying on Content-Length', async () => {
  const {createHandler}=await import('../shared-cms/core.mjs');
  const handler=createHandler({content:async()=>({content:{records:[]},revision:1})});
  const send=padding=>handler(new Request('https://cms.test/',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({site:'boujeelux',action:'publicContent',padding}),
  }));
  const legitimate=await send('a'.repeat(4_300_000));
  assert.equal(legitimate.status,200);
  const oversized=await send('😎'.repeat(1_100_000));
  assert.equal(oversized.status,413);
  assert.deepEqual(await oversized.json(),{error:'Request is too large.'});
});

test('mutable operations receive the authorized session hash for database revalidation', async () => {
  const {createHandler,sha256}=await import('../shared-cms/core.mjs');
  const token='b'.repeat(43), tokenHash=await sha256(token), seen=[];
  const account={site:'boujeelux',role:'owner',state:'active',must_change:false,epoch:3,username:'owner',user_id:'user-1'};
  const repo={
    session:async()=>({site:'boujeelux',scope:'full',epoch:3,token_hash:tokenHash,expires_at:new Date(Date.now()+600000).toISOString(),last_seen:new Date().toISOString(),account}),
    touch:async()=>{}, validateMedia:async()=>{},
    save:async(...args)=>{seen.push(['save',...args]);return {content:{records:[]},revision:2,updatedAt:new Date().toISOString()};},
    status:async(...args)=>{seen.push(['status',...args]);return {ok:true};},
    upload:async(...args)=>{seen.push(['upload',...args]);return {src:'/api/media/test.png',name:'test.png'};},
  };
  const handler=createHandler(repo);
  const post=body=>handler(new Request('https://cms.test/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
  assert.equal((await post({site:'boujeelux',action:'save',token,revision:1,content:{records:[]}})).status,200);
  assert.equal((await post({site:'boujeelux',action:'status',token,id:'11111111-1111-1111-1111-111111111111',status:'Closed'})).status,200);
  const png=btoa(String.fromCharCode(137,80,78,71,13,10,26,10,0));
  assert.equal((await post({site:'boujeelux',action:'upload',token,type:'image/png',name:'test.png',base64:png})).status,201);
  assert.equal(seen.find(row=>row[0]==='save').at(-1),tokenHash);
  assert.equal(seen.find(row=>row[0]==='status').at(-1),tokenHash);
  assert.equal(seen.find(row=>row[0]==='upload').at(-1),tokenHash);
});

test('rate-limit keys are bounded buckets and never contain raw usernames or forwarded addresses', async () => {
  const {rateLimitKeys}=await import('../shared-cms/core.mjs');
  const keys=await rateLimitKeys('login','chida','owner-name','203.0.113.7, 198.51.100.9');
  assert.equal(keys.length,3);
  assert.ok(keys.every(({key})=>/^login:(global|account:\d{1,4}|pair:\d{1,4}):chida$/.test(key)));
  assert.ok(keys.every(({key})=>!key.includes('owner-name')&&!key.includes('203.0.113.7')&&!key.includes('198.51.100.9')));
  const many=new Set();
  for(let i=0;i<3000;i++)for(const {key} of await rateLimitKeys('login','chida',`user-${i}`,`198.51.100.${i%255}`))many.add(key);
  assert.ok(many.size<=2049,'login limiter keyspace must stay globally bounded per site');
});

test('rejected guarded media registration removes the already-uploaded storage object', async () => {
  const {SupabaseRepository}=await import('../shared-cms/repository.mjs');
  const removed=[];
  const bucket={
    upload:async()=>({error:null}),
    remove:async paths=>{removed.push(...paths);return {data:null,error:null};},
  };
  const db={
    storage:{from:()=>bucket},
    rpc:async name=>{assert.equal(name,'cms_register_media_guarded');return {data:false,error:null};},
  };
  const repo=new SupabaseRepository(db,()=>{throw new Error('unused');});
  await assert.rejects(()=>repo.upload('chida',{bytes:new Uint8Array([1]),ext:'png',name:'x.png',type:'image/png',actor:'user'},'a'.repeat(64)),/sign in/i);
  assert.equal(removed.length,1);
  assert.match(removed[0],/^chida\/[a-f0-9-]{36}\.png$/);
});

test('guard migration locks sessions and gates all mutable database operations', async () => {
  const {readFile}=await import('node:fs/promises');
  const sql=await readFile(new URL('../supabase/migrations/20261018102254_dual_cms_guards.sql',import.meta.url),'utf8');
  for(const name of ['cms_lock_session','cms_save_document_guarded','cms_update_enquiry_status_guarded','cms_register_media_guarded'])assert.match(sql,new RegExp(`function public\\.${name}\\b`));
  assert.match(sql,/from public\.cms_accounts where user_id=uid for update/i);
  assert.match(sql,/delete from public\.cms_rate_limits where reset_at<=now\(\)/i);
  assert.match(sql,/revoke all on function[\s\S]+from public,anon,authenticated/i);
});

const carSettings={heroTitle:'Premium cars',heroSubtitle:'Trusted vehicles',heroImage:'/hero.webp',heroVehicleSlug:'',aboutTitle:'About Chida',aboutText:'A trusted automotive team.',seoTitle:'Chida Moore Automobiles',seoDescription:'Premium vehicles available in Lagos.',siteUrl:'https://cars.example.com/',inspectionEnabled:true,sourcingEnabled:true,contact:{whatsapp:[{display:'WhatsApp one',href:'https://wa.me/2348000000001'},{display:'WhatsApp two',href:'https://wa.me/2348000000002'}],phones:[{display:'Phone one',href:'tel:+2348000000001'},{display:'Phone two',href:'tel:+2348000000002'},{display:'Phone three',href:'tel:+2348000000003'}],emails:['one@example.com','two@example.com'],instagram:'https://instagram.com/chida'}};
const car=(overrides={})=>({slug:'lexus-rx',name:'Lexus RX',make:'Lexus',year:'2024',image:'/lexus.webp',alt:'Lexus RX exterior',availability:'Available',condition:'Tokunbo',price:'Price on enquiry',priceValue:0,showPrice:false,status:'published',featured:false,description:'',specifications:[],videos:[],gallery:[{src:'/lexus.webp',alt:'Lexus RX exterior',label:'Exterior'}],...overrides});
const apartment=(photo={src:'/flat.webp',alt:'Living room',illustrative:false})=>({id:'lagos-flat',slug:'lagos-flat',name:'Lagos Flat',subtitle:'',description:'Comfortable apartment',location:'Lagos',address:'',partyRate:'',caution:'',policy:'',availabilityNote:'',bedrooms:1,maxGuests:2,availability:'Available on request',amenities:[],rate:{basis:'quote',currency:'NGN',amount:''},photos:[photo]});

test('authoritative content save rejects unknown fields and malformed gallery/spec rows safely', () => {
  for(const change of [v=>({...v,gallery:[null]}),v=>({...v,gallery:[{...v.gallery[0],script:'unsafe'}]}),v=>({...v,specifications:[null]}),v=>({...v,administrator:true})]){
    assert.throws(()=>api.validateContent('chida',{vehicles:[change(car())],settings:structuredClone(carSettings)}),error=>error instanceof api.CmsError&&error.status===400);
  }
  const base={records:[{id:'lagos-flat',version:1,draft:apartment(),published:null}]};
  for(const change of [c=>({...c,administrator:true}),c=>({...c,records:[{...c.records[0],draft:{...apartment(),photos:[{src:'/flat.webp',alt:'Living room',illustrative:false,script:'unsafe'}]}}]})]){
    assert.throws(()=>api.validateContent('boujeelux',change(structuredClone(base))),error=>error instanceof api.CmsError&&error.status===400);
  }
});

test('car public projection redacts hidden numeric prices without mutating private content',()=>{
  const hidden=car({priceValue:42_500_000,showPrice:false,price:'Price on enquiry'});
  const shown=car({slug:'priced-car',priceValue:51_000_000,showPrice:true,price:'₦51,000,000'});
  const privateContent={vehicles:[hidden,shown],settings:structuredClone(carSettings)};
  const projected=api.publicProjection('chida',privateContent);
  assert.equal(projected.vehicles[0].priceValue,0);
  assert.equal(projected.vehicles[0].price,'Price on enquiry');
  assert.equal(projected.vehicles[1].priceValue,51_000_000);
  assert.equal(privateContent.vehicles[0].priceValue,42_500_000);
  assert.doesNotThrow(()=>api.validateContent('chida',structuredClone(projected)));
});

test('repository sanitizes legacy stored public car documents on read',async()=>{
  const stored={vehicles:[car({priceValue:42_500_000,showPrice:false,price:'Price on enquiry'})],settings:structuredClone(carSettings)};
  const query={select(){return this;},eq(){return this;},async single(){return {data:{published:stored,revision:7,updated_at:'2026-10-18T00:00:00Z'},error:null};}};
  const db={from(name){assert.equal(name,'cms_documents');return query;}};
  const {SupabaseRepository}=await import('../shared-cms/repository.mjs');
  const repo=new SupabaseRepository(db,()=>{throw new Error('unused');});
  const result=await repo.content('chida',true);
  assert.equal(result.content.vehicles[0].priceValue,0);
  assert.equal(result.content.vehicles[0].price,'Price on enquiry');
  assert.equal(stored.vehicles[0].priceValue,42_500_000);
});

test('legacy vehicles default restockExpected false and Unavailable remains independent of publication', () => {
  const legacy=api.validateContent('chida',{vehicles:[car()],settings:structuredClone(carSettings)});
  assert.equal(legacy.vehicles[0].restockExpected,false);
  const unavailable=api.validateContent('chida',{vehicles:[car({availability:'Unavailable',restockExpected:true})],settings:structuredClone(carSettings)});
  assert.equal(unavailable.vehicles[0].status,'published');
  assert.equal(api.publicProjection('chida',unavailable).vehicles[0].availability,'Unavailable');
  assert.throws(()=>api.validateContent('chida',{vehicles:[car({restockExpected:'yes'})],settings:structuredClone(carSettings)}),/classification/i);
  assert.throws(()=>api.validateContent('chida',{vehicles:[car({availability:'Available',restockExpected:true})],settings:structuredClone(carSettings)}),/restock/i);
  assert.throws(()=>api.validateContent('chida',{vehicles:[car({availability:'Reserved',restockExpected:true})],settings:structuredClone(carSettings)}),/restock/i);
});

test('legacy apartment photos remain valid while optional labels are trimmed and bounded', () => {
  const persistedPhoto={src:'/flat.webp',alt:'Living room',illustrative:false,id:1,caption:'Actual living room',category:'Living area',scope:'property-wide'};
  const persisted=api.validateContent('boujeelux',{records:[{id:'lagos-flat',version:1,draft:apartment(persistedPhoto),published:null}]});
  assert.deepEqual(persisted.records[0].draft.photos[0],persistedPhoto,'Preserve approved persisted photo metadata');
  const legacy=api.validateContent('boujeelux',{records:[{id:'lagos-flat',version:1,draft:apartment(),published:null}]});
  assert.equal('label' in legacy.records[0].draft.photos[0],false);
  const labelled=api.validateContent('boujeelux',{records:[{id:'lagos-flat',version:1,draft:apartment({src:'/flat.webp',alt:'Living room',illustrative:false,label:'  Living room  '}),published:null}]});
  assert.equal(labelled.records[0].draft.photos[0].label,'Living room');
  assert.throws(()=>api.validateContent('boujeelux',{records:[{id:'lagos-flat',version:1,draft:apartment({src:'/flat.webp',alt:'Living room',illustrative:false,label:' '}),published:null}]}),/photographs/i);
  assert.throws(()=>api.validateContent('boujeelux',{records:[{id:'lagos-flat',version:1,draft:apartment({src:'/flat.webp',alt:'Living room',illustrative:false,label:'x'.repeat(101)}),published:null}]}),/photographs/i);
});

test('trackChat accepts only general or currently published listing slugs and ignores no caller count', async () => {
  const {createHandler}=await import('../shared-cms/core.mjs');
  const tracked=[];
  const repo={limit:async()=>true,content:async(site)=>site==='chida'?{content:{vehicles:[car(),car({slug:'hidden',status:'draft'})]}}:{content:{records:[{published:apartment()}]}},trackChat:async(site,slug)=>{tracked.push([site,slug]);return {ok:true};}};
  const handler=createHandler(repo);
  const post=(body,forwarded='198.51.100.7')=>handler(new Request('https://cms.test/',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':forwarded},body:JSON.stringify(body)}));
  assert.equal((await post({site:'chida',action:'trackChat',listingSlug:''})).status,201);
  assert.equal((await post({site:'chida',action:'trackChat',listingSlug:'lexus-rx'})).status,201);
  assert.equal((await post({site:'boujeelux',action:'trackChat',listingSlug:'lagos-flat'})).status,201);
  assert.equal((await post({site:'chida',action:'trackChat',listingSlug:'hidden'})).status,404);
  assert.equal((await post({site:'chida',action:'trackChat',listingSlug:'lexus-rx',count:99})).status,400);
  assert.equal((await post({site:'chida',action:'trackChat',listingSlug:'../other'})).status,400);
  assert.deepEqual(tracked,[['chida',''],['chida','lexus-rx'],['boujeelux','lagos-flat']]);
});

test('trackChat is rate limited with bounded source keys', async () => {
  const {createHandler,rateLimitKeys}=await import('../shared-cms/core.mjs');
  const keys=await rateLimitKeys('trackChat','chida','', '203.0.113.8, 198.51.100.10');
  assert.ok(keys.every(({key})=>/^chat:(global|source:\d{1,4}):chida$/.test(key)));
  const handler=createHandler({limit:async key=>!key.startsWith('chat:source:'),content:async()=>({content:{vehicles:[]}}),trackChat:async()=>({ok:true})});
  const response=await handler(new Request('https://cms.test/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({site:'chida',action:'trackChat',listingSlug:''})}));
  assert.equal(response.status,429);
});

test('metrics requires a full same-site session and returns site-scoped aggregates', async () => {
  const {createHandler,sha256}=await import('../shared-cms/core.mjs');
  const token='m'.repeat(43),hash=await sha256(token),calls=[];
  const account={site:'chida',role:'owner',state:'active',must_change:false,epoch:1,username:'owner',user_id:'user'};
  const session={site:'chida',scope:'full',epoch:1,token_hash:hash,expires_at:new Date(Date.now()+600000).toISOString(),last_seen:new Date().toISOString(),account};
  const repo={session:async()=>session,touch:async()=>{},metrics:async(site,sessionHash)=>{calls.push([site,sessionHash]);return {total:3,byListing:[{listingSlug:'lexus-rx',count:3}]};}};
  const handler=createHandler(repo);
  const post=site=>handler(new Request('https://cms.test/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({site,action:'metrics',token})}));
  assert.deepEqual(await (await post('chida')).json(),{total:3,byListing:[{listingSlug:'lexus-rx',count:3}]});
  assert.equal((await post('boujeelux')).status,401);
  session.scope='setup';session.account.must_change=true;
  assert.equal((await post('chida')).status,428);
  assert.deepEqual(calls,[['chida',hash]]);
});

test('repository chat metrics use server-side aggregate RPCs without accepting a count', async () => {
  const {SupabaseRepository}=await import('../shared-cms/repository.mjs');
  const calls=[];
  const db={rpc:async(name,args)=>{calls.push([name,args]);return {data:name==='cms_chat_metrics'?{authorized:true,total:2,byListing:[{listingSlug:'',count:2}]}:true,error:null};}};
  const repo=new SupabaseRepository(db,()=>{});
  assert.deepEqual(await repo.trackChat('chida','lexus-rx'),{ok:true});
  assert.deepEqual(await repo.metrics('chida','a'.repeat(64)),{total:2,byListing:[{listingSlug:'',count:2}]});
  assert.deepEqual(calls,[['cms_track_chat',{p_site:'chida',p_slug:'lexus-rx'}],['cms_chat_metrics',{p_site:'chida',p_hash:'a'.repeat(64)}]]);
});

test('chat metric migration uses atomic day buckets, retention, session guards and service-only access', async () => {
  const {readdir,readFile}=await import('node:fs/promises');
  const directory=new URL('../supabase/migrations/',import.meta.url);
  const names=(await readdir(directory)).filter(name=>name.endsWith('_cms_chat_metrics.sql'));
  assert.equal(names.length,1,'create the migration with `supabase migration new cms_chat_metrics`');
  const sql=await readFile(new URL(names[0],directory),'utf8');
  assert.match(sql,/create table public\.cms_chat_clicks/i);
  assert.match(sql,/primary key \(site,listing_slug,day\)/i);
  assert.match(sql,/on conflict \(site,listing_slug,day\)[\s\S]*count=public\.cms_chat_clicks\.count\+1/i);
  assert.match(sql,/delete from public\.cms_chat_clicks where day</i);
  assert.match(sql,/public\.cms_lock_session\(p_site,p_hash\)/i);
  assert.match(sql,/enable row level security/i);
  assert.match(sql,/revoke all on (table )?public\.cms_chat_clicks from public,anon,authenticated/i);
  assert.match(sql,/revoke all on function[\s\S]+from public,anon,authenticated/i);
  assert.match(sql,/grant execute on function[\s\S]+to service_role/i);
});
