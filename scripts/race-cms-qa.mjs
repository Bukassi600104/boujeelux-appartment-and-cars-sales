// Deliberately exercises the live DB-backed revoke/write race using QA accounts only.
import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const file='.cms-private/qa.json',endpoint='https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms';
const accounts=JSON.parse(await readFile(file,'utf8'));
async function call(site,action,data={}){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,action,...data})});return {status:r.status,body:await r.json()};}
if(process.argv[2]==='prepare'){
 for(const a of accounts){const login=await call(a.site,'login',{username:a.nextUsername,password:a.nextPassword});assert.equal(login.status,200,`${a.site}: login failed`);a.raceToken=login.body.token;const before=await call(a.site,'content',{token:a.raceToken});assert.equal(before.status,200);a.raceContent=before.body.content;a.raceRevision=before.body.revision;}
 await writeFile(file,JSON.stringify(accounts),{mode:0o600});console.log('QA-only race sessions prepared; no secrets logged.');
}else if(process.argv[2]==='run'){
 const pending=accounts.flatMap(a=>[
  call(a.site,'save',{token:a.raceToken,revision:a.raceRevision,content:a.raceContent}).then(r=>({site:a.site,action:'save',...r})),
  call(a.site,'upload',{token:a.raceToken,type:'image/png',name:'CMS revoked-session race test.png',base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ioAAAAASUVORK5CYII='}).then(r=>({site:a.site,action:'upload',...r}))
 ]);
 const results=await Promise.all(pending);for(const r of results)assert.equal(r.status,401,`${r.site}: stale ${r.action} was not refused`);
 for(const a of accounts){const current=await call(a.site,'publicContent');assert.equal(current.body.revision,a.raceRevision,`${a.site}: stale request altered content`);const login=await call(a.site,'login',{username:a.nextUsername,password:a.nextPassword});assert.equal(login.status,200);a.fullToken=login.body.token;const media=await call(a.site,'mediaList',{token:a.fullToken});assert.equal(media.status,200);assert.ok(!media.body.some(m=>m.name==='CMS revoked-session race test.png'),'revoked media registration leaked into CMS');}
 await writeFile(file,JSON.stringify(accounts),{mode:0o600});console.log(JSON.stringify({staleWritesRefused:results.map(({site,action,status})=>({site,action,status})),contentUnchanged:true,revokedMediaAbsent:true,passwordsLogged:false},null,2));
}else throw new Error('Use prepare or run');
