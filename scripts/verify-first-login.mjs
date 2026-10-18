// Destructive only to the explicitly designated QA accounts, never client accounts.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const file='.cms-private/qa.json';
const accounts=JSON.parse(await readFile(file,'utf8'));
const selected=process.argv.slice(2);
for(const a of accounts.filter(a=>!selected.length||selected.includes(a.site))){
 const car=a.site==='chida';
 const base=car?(process.env.CHIDA_TEST_URL??'http://localhost:5173'):(process.env.BOUJEELUX_TEST_URL??'http://localhost:5180');
 const login=car?'/api/admin/session':'/api/cms/login',rotate=car?'/api/admin/credentials':'/api/cms/rotate',content=car?'/api/admin/content':'/api/cms/content';
 const call=(url,method,body,cookie)=>fetch(base+url,{method,redirect:'manual',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 let r=await call(login,'POST',{username:a.nextUsername,password:a.nextPassword});
 assert.equal(r.status,200,`${a.site}: initial login`);const session=await r.json();assert.equal(session.mustChange,true,'QA account must be reset to setup scope by the operator first');assert.ok(!('token' in session));
 const cookie=r.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);assert.ok(/HttpOnly/i.test(r.headers.get('set-cookie')??''));assert.ok(/SameSite=Strict/i.test(r.headers.get('set-cookie')??''));
 r=await call('/admin','GET',null,cookie);assert.equal(r.status,307);assert.match(r.headers.get('location'),/\/admin\/credentials$/);
 r=await call(content,car?'GET':'POST',car?null:{},cookie);assert.equal(r.status,428,'setup session cannot access content');
 const previousUsername=a.nextUsername,previousPassword=a.nextPassword;
 const username=a.site+'-qa-'+randomBytes(4).toString('hex'),password=randomBytes(24).toString('base64url');
 r=await call(rotate,car?'PUT':'POST',{currentPassword:previousPassword,username,password,acknowledged:true},cookie);assert.equal(r.status,200,`${a.site}: credential change`);
 // Persist the successful QA rotation before later assertions can fail.
 a.nextUsername=username;a.nextPassword=password;delete a.fullToken;await writeFile(file,JSON.stringify(accounts),{mode:0o600});
 const result=await r.json();assert.ok(!('token' in result));assert.match(r.headers.get('set-cookie')??'',/Max-Age=0/i,'rotation must clear browser session');
 r=await call('/admin','GET');assert.equal(r.status,307);assert.match(r.headers.get('location'),/\/admin\/login$/,'rotation must not create dashboard access');
 r=await call(content,car?'GET':'POST',car?null:{},cookie);assert.equal(r.status,401,'old cookie must be revoked');
 r=await call(login,'POST',{username:previousUsername,password:previousPassword});assert.ok([401,429].includes(r.status),'old identity must be rejected, including when throttled');
 r=await call(login,'POST',{username,password:previousPassword});assert.equal(r.status,401,'the old password must fail with the new username');
 r=await call(login,'POST',{username,password});assert.equal(r.status,200,'new login');assert.equal((await r.json()).mustChange,false);
 const fullCookie=r.headers.get('set-cookie')?.split(';')[0];r=await call('/admin','GET',null,fullCookie);assert.equal(r.status,200,'dashboard with new login');
 await call(car?'/api/admin/session':'/api/cms/logout',car?'DELETE':'POST',car?null:{},fullCookie);
 console.log(JSON.stringify({site:a.site,passed:['first login setup only','HttpOnly Strict cookie; no token exposed','dashboard redirects to setup','content denied before rotation','rotation clears cookie and returns no token','no automatic dashboard access','old session and credentials rejected','new credentials log in to dashboard'],secretsLogged:false}));
}
