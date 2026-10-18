import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {allowedCmsAction,cmsEnvelope,isPlainObject,isSameOrigin,publicLoginResult,secureSessionCookie,validateCredentials,CMS_COOKIE} from '../lib/cms-contract';

test('CMS proxy exposes only the expected action surface',()=>{
  for(const action of ['publicContent','login','session','rotate','logout','content','save','mediaList','upload','enquiries','status','audit','enquire'])assert.equal(allowedCmsAction(action),true);
  for(const action of ['', 'deleteEverything','../login','constructor'])assert.equal(allowedCmsAction(action),false);
});

test('mutations require an exact same-origin request',()=>{
  assert.equal(isSameOrigin('https://boujeelux.example','https://boujeelux.example/api/cms/save'),true);
  assert.equal(isSameOrigin('https://evil.example','https://boujeelux.example/api/cms/save'),false);
  assert.equal(isSameOrigin(null,'https://boujeelux.example/api/cms/save'),false);
});

test('credential rotation validates username and UTF-8 password boundaries',()=>{
  assert.deepEqual(validateCredentials('boujee.admin','correct horse battery staple'),[]);
  assert.ok(validateCredentials('bad name','short').length>=2);
  assert.match(validateCredentials('valid_user','😀'.repeat(19))[0],/72 UTF-8 bytes/);
  assert.equal(CMS_COOKIE,'boujeelux_cms_session');
});

test('session cookies are non-secure only on explicit loopback HTTP origins',()=>{
  assert.equal(secureSessionCookie('http://localhost:5180/api/cms/login'),false);
  assert.equal(secureSessionCookie('http://127.0.0.1:5180/api/cms/login'),false);
  assert.equal(secureSessionCookie('https://boujeelux.example/api/cms/login'),true);
  assert.equal(secureSessionCookie('http://boujeelux.example/api/cms/login'),true);
});

test('caller data cannot override the fixed CMS routing identity or inject a token',()=>{
  assert.deepEqual(cmsEnvelope('content',{site:'cars',action:'logout',token:'attacker',value:1},undefined),{value:1,site:'boujeelux',action:'content'});
  assert.deepEqual(cmsEnvelope('save',{token:'attacker'},'cookie-token'),{site:'boujeelux',action:'save',token:'cookie-token'});
});

test('login responses never expose the backend session token',()=>{
  assert.deepEqual(publicLoginResult({token:'secret',mustChange:true,username:'owner',extra:'hidden'}),{mustChange:true,username:'owner'});
  assert.equal(isPlainObject(null),false);assert.equal(isPlainObject([]),false);assert.equal(isPlainObject({}),true);
});

test('credential rotation requires an explicit saved-credentials acknowledgment',async()=>{
  const source=await readFile(new URL('../components/auth-forms.tsx',import.meta.url),'utf8');
  assert.match(source,/I have securely saved both my new username and password/);
  assert.match(source,/disabled=\{!savedCredentials\}/);
  assert.match(source,/Use the new username and password you saved to sign in again/);
});
