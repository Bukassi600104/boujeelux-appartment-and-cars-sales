// Tests issued credentials without consuming the client's first-login rotation.
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const clients=JSON.parse(await readFile('.cms-private/clients.json','utf8'));
for(const a of clients){
 const car=a.site==='chida';
 const base=car?(process.env.CHIDA_TEST_URL??'http://localhost:5174'):(process.env.BOUJEELUX_TEST_URL??'http://localhost:5180');
 const request=(path,method,body,cookie)=>fetch(base+path,{method,redirect:'manual',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 let r=await request(car?'/api/admin/session':'/api/cms/login','POST',{username:a.username,password:a.password});
 assert.equal(r.status,200,`${a.site}: issued account sign-in`);const result=await r.json();assert.equal(result.mustChange,true);assert.ok(!('token'in result));
 const setCookie=r.headers.get('set-cookie')??'',cookie=setCookie.split(';')[0];assert.ok(/HttpOnly/i.test(setCookie));assert.ok(/SameSite=Strict/i.test(setCookie));if(base.startsWith('https:'))assert.ok(/Secure/i.test(setCookie));
 try{
  r=await request('/admin','GET',null,cookie);assert.equal(r.status,307);assert.match(r.headers.get('location')??'',/\/admin\/credentials$/);
  r=await request('/admin/credentials','GET',null,cookie);assert.equal(r.status,200);const html=await r.text();assert.match(html,/username/i);assert.match(html,/password/i);
  r=await request(car?'/api/admin/content':'/api/cms/content',car?'GET':'POST',car?null:{},cookie);assert.equal(r.status,428,'issued credentials cannot access dashboard content before replacement');
 }finally{await request(car?'/api/admin/session':'/api/cms/logout',car?'DELETE':'POST',car?null:{},cookie);}
 console.log(JSON.stringify({site:a.site,issuedLogin:true,setupRedirect:true,dashboardDenied:true,credentialsNotChanged:true,cookieProtected:true,secretsLogged:false}));
}
