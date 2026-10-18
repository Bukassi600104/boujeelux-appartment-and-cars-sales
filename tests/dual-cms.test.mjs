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
  const account={site:'boujeelux',state:'active',must_change:false,epoch:3,username:'owner',user_id:'user-1'};
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
