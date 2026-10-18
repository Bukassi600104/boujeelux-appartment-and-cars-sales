import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,sha256} from '../shared-cms/core.mjs';
import {SupabaseRepository} from '../shared-cms/repository.mjs';

const token='k'.repeat(43),hash=await sha256(token);
function fixture(role='owner',site='chida'){
 const account={user_id:'11111111-1111-1111-1111-111111111111',site,username:'current-owner',role,state:'active',epoch:4,must_change:false};
 const seen=[];
 const repo={
  session:async()=>({account,site,epoch:4,scope:'full',token_hash:hash,expires_at:new Date(Date.now()+600000).toISOString(),last_seen:new Date().toISOString()}),touch:async()=>{},limit:async()=>true,
  verifyPassword:async(a,p)=>a.user_id===account.user_id&&p==='Current passphrase 123!',
  account:async()=>null,
  administrators:async(...args)=>{seen.push(['list',...args]);return {accounts:[{id:account.user_id,username:account.username,role,state:'active',mustChange:false,createdAt:'2026-10-18T00:00:00Z'}]};},
  createAdministrator:async(...args)=>{seen.push(['create',...args]);return {ok:true};},
  updateAdministrator:async(...args)=>{seen.push(['update',...args]);return {ok:true};},
  beginPasswordChange:async(...args)=>{seen.push(['beginPassword',...args]);return 'lease';},
  changePassword:async(...args)=>{seen.push(['password',...args]);},
  finishRotation:async(...args)=>{seen.push(['finish',...args]);},
  content:async()=>({content:{records:[]},revision:1}),save:async()=>({revision:2}),validateMedia:async()=>{},
  mediaList:async()=>[],enquiries:async()=>[],audit:async()=>[],metrics:async()=>({total:0,byListing:[]}),
 };
 const handler=createHandler(repo);
 const post=body=>handler(new Request('https://cms.test/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({site,token,...body})}));
 return {account,repo,seen,post};
}
test('session presents known permissions and rejects unknown roles',async()=>{
 for(const [role,write,manageAdmins] of [['owner',true,true],['editor',true,false],['viewer',false,false]]){
  const f=fixture(role);assert.deepEqual(await (await f.post({action:'session'})).json(),{username:'current-owner',mustChange:false,role,permissions:{read:true,write,manageAdmins,manageListings:write,manageMedia:write,manageWebsiteSettings:role==='owner',publishContent:role==='owner'}});
 }
 const f=fixture('superuser');assert.equal((await f.post({action:'content'})).status,403);
});
test('viewer can inspect content but cannot write; editor cannot manage accounts',async()=>{
 for(const site of ['chida','boujeelux']){
  const viewer=fixture('viewer',site);assert.equal((await viewer.post({action:'content'})).status,200);
  for(const action of ['save','upload','status'])assert.equal((await viewer.post({action})).status,403);
  for(const role of ['editor','viewer']){const f=fixture(role,site);for(const action of ['administrators','createAdministrator','updateAdministrator'])assert.equal((await f.post({action})).status,403);assert.equal(f.seen.length,0);}
 }
});
test('owner account management validates current password, fields and same-site full session',async()=>{
 const f=fixture();
 assert.equal((await f.post({action:'administrators'})).status,200);
 const create={action:'createAdministrator',username:'new-editor',password:'New temporary password 123!',role:'editor',currentPassword:'Current passphrase 123!'};
 assert.equal((await f.post({...create,currentPassword:'wrong'})).status,401);
 assert.equal((await f.post({...create,role:'superuser'})).status,400);
 assert.equal((await f.post({...create,site:'boujeelux'})).status,401);
 assert.equal((await f.post(create)).status,201);
 const payload=await (await f.post({action:'updateAdministrator',id:'22222222-2222-2222-2222-222222222222',role:'viewer',state:'disabled',currentPassword:'Current passphrase 123!'})).json();
 assert.deepEqual(payload,{ok:true});assert.equal(JSON.stringify(payload).includes('password'),false);
 assert.equal(f.seen.filter(x=>x[0]==='create').length,1);assert.equal(f.seen.find(x=>x[0]==='create').at(-1),hash);
 f.account.must_change=true;assert.equal((await f.post(create)).status,428);
});
test('self password change preserves username, verifies existing password, revokes before Auth and returns no login',async()=>{
 const f=fixture('viewer','boujeelux');
 const body={action:'changePassword',currentPassword:'Current passphrase 123!',newPassword:'New personal password 456!',acknowledged:true};
 assert.equal((await f.post({...body,acknowledged:false})).status,400);
 assert.equal((await f.post({...body,currentPassword:'wrong'})).status,401);
 assert.equal((await f.post({...body,newPassword:body.currentPassword})).status,400);
 assert.equal((await f.post({...body,newPassword:'short'})).status,400);
 const response=await f.post(body);assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
 assert.deepEqual(f.seen.map(x=>x[0]),['beginPassword','password','finish']);
 assert.equal(f.seen[0][1],'boujeelux');assert.equal(f.seen[0][2],hash);assert.equal(f.seen[2][2],'current-owner');
});
test('failed password rotation leaves access locked and never reports success',async()=>{
 const f=fixture();f.repo.changePassword=async()=>{throw new Error('Auth unavailable');};
 const response=await f.post({action:'changePassword',currentPassword:'Current passphrase 123!',newPassword:'New personal password 456!',acknowledged:true});
 assert.equal(response.status,503);assert.equal(f.seen.some(x=>x[0]==='finish'),false);
});
test('repository maps safe account results and rejects refused transactions without exposing Auth details',async()=>{
 const removed=[],calls=[];
 const db={auth:{admin:{createUser:async params=>{calls.push(['auth',params]);return {data:{user:{id:'22222222-2222-2222-2222-222222222222'}},error:null};},deleteUser:async id=>{removed.push(id);return {error:null};}}},rpc:async(name,args)=>{calls.push([name,args]);return {data:name==='cms_list_administrators'?{authorized:true,accounts:[{id:'11111111-1111-1111-1111-111111111111',username:'owner',role:'owner',state:'active',mustChange:false,createdAt:'2026-10-18T00:00:00Z'}]}:{authorized:false},error:null};}};
 const repo=new SupabaseRepository(db,()=>{});
 assert.deepEqual(await repo.administrators('chida',hash),{accounts:[{id:'11111111-1111-1111-1111-111111111111',username:'owner',role:'owner',state:'active',mustChange:false,createdAt:'2026-10-18T00:00:00Z'}]});
 await assert.rejects(()=>repo.createAdministrator('chida',{username:'new-editor',password:'Never return this password',role:'editor'},hash),e=>e.status===403&&!e.message.includes('Never return'));
 assert.deepEqual(removed,['22222222-2222-2222-2222-222222222222']);
 assert.equal(calls.find(x=>x[0]==='cms_create_administrator').at(-1).p_hash,hash);
 db.rpc=async()=>({data:{authorized:true,result:'last_owner'},error:null});
 await assert.rejects(()=>repo.updateAdministrator('chida',{id:'11111111-1111-1111-1111-111111111111',role:'editor'},hash),e=>e.status===409&&/owner/i.test(e.message));
});
test('uncertain administrator registration does not delete a potentially committed account',async()=>{
 const removed=[];
 const db={auth:{admin:{createUser:async()=>({data:{user:{id:'22222222-2222-2222-2222-222222222222'}},error:null}),deleteUser:async id=>removed.push(id)}},rpc:async()=>({data:null,error:{message:'network lost after transaction'}})};
 const repo=new SupabaseRepository(db,()=>{});
 await assert.rejects(()=>repo.createAdministrator('chida',{username:'new-editor',password:'Never return this password',role:'editor'},hash));
 assert.deepEqual(removed,[]);
});
test('editor capabilities are independent and unknown or nonboolean grants are rejected',async()=>{
 const f=fixture('editor');Object.assign(f.account,{manage_listings:false,manage_media:false,manage_website_settings:true});
 const identity=await (await f.post({action:'session'})).json();assert.deepEqual(identity.permissions,{read:true,write:true,manageAdmins:false,manageListings:false,manageMedia:false,manageWebsiteSettings:true,publishContent:false});
 assert.equal((await f.post({action:'upload'})).status,403);
 const owner=fixture();const create={action:'createAdministrator',username:'new-editor',password:'New temporary password 123!',role:'editor',currentPassword:'Current passphrase 123!'};
 for(const permissions of [{manageAdmins:true},{manageMedia:'true'},null,[]])assert.equal((await owner.post({...create,permissions})).status,400);
 assert.equal((await owner.post({...create,permissions:{manageListings:true,manageMedia:false,manageWebsiteSettings:false}})).status,201);
 assert.deepEqual(owner.seen.find(x=>x[0]==='create')[2].permissions,{manageListings:true,manageMedia:false,manageWebsiteSettings:false});
});
test('publication is explicit, full-session and separately permission-guarded',async()=>{
 const f=fixture('editor');assert.equal((await f.post({action:'publish',revision:1,scope:'all',acknowledged:true})).status,403);
 f.account.publish_content=true;f.repo.publish=async(...args)=>{f.seen.push(['publish',...args]);return {content:{},revision:2};};
 assert.equal((await f.post({action:'publish',revision:1,scope:'all',acknowledged:false})).status,400);
 assert.equal((await f.post({action:'publish',revision:1,scope:'all',acknowledged:true})).status,200);
 assert.equal(f.seen[0].at(-1),hash);assert.equal(f.seen[0][3],'all');
 f.account.must_change=true;assert.equal((await f.post({action:'publish',revision:1,scope:'all',acknowledged:true})).status,428);
});
