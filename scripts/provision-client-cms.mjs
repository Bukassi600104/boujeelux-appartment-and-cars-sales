// Operator-run setup. No password is printed, hardcoded or committed.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';import path from 'node:path';
const directory=path.resolve('.cms-private'),file=path.join(directory,'clients.json');
const endpoint='https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms';
async function call(site,action,data){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,action,...data})});return {status:r.status,body:await r.json()};}
if(process.argv[2]==='prepare'){
 await mkdir(directory,{recursive:true});const records=['chida','boujeelux'].map(site=>{const bootstrapToken=randomBytes(32).toString('base64url');return {site,username:site+'-admin',password:randomBytes(24).toString('base64url'),bootstrapToken,hash:createHash('sha256').update(bootstrapToken).digest('hex')};});
 await writeFile(file,JSON.stringify(records),{mode:0o600,flag:'wx'});
 console.log(JSON.stringify(records.map(({site,hash})=>({site,hash}))));
}else if(process.argv[2]==='provision'){
 const records=JSON.parse(await readFile(file,'utf8'));
 for(const account of records){if(!account.provisioned){const result=await call(account.site,'bootstrap',{bootstrapToken:account.bootstrapToken,username:account.username,password:account.password});if(result.status!==201)throw new Error(`${account.site}: provisioning did not succeed (${result.status}). Reconcile before retrying.`);account.provisioned=true;await writeFile(file,JSON.stringify(records),{mode:0o600});}
 const result=await call(account.site,'login',{username:account.username,password:account.password});if(result.status!==200||result.body.mustChange!==true)throw new Error(`${account.site}: mandatory first-login setup could not be verified.`);const denied=await call(account.site,'content',{token:result.body.token});if(denied.status!==428)throw new Error(`${account.site}: temporary login incorrectly authorized dashboard.`);await call(account.site,'logout',{token:result.body.token});}
 const website={chida:process.env.CHIDA_PUBLIC_URL??'http://localhost:5173',boujeelux:process.env.BOUJEELUX_PUBLIC_URL??'http://127.0.0.1:5180'};
 const text=['PRIVATE CLIENT CMS HANDOVER — 18 October 2026','Keep this file private. These are temporary credentials, not the developer’s login.','',...records.flatMap(a=>[a.site==='chida'?'CHIDA MOORE AUTOMOBILES':'BOUJEELUX APARTMENTS',`CMS: ${website[a.site]}/admin/login`,`Initial username: ${a.username}`,`Initial password: ${a.password}`,'']), 'FIRST LOGIN: Change BOTH username and password. Acknowledge the reminder to save and secure them.','You will be signed out and returned to login. Use your NEW credentials to enter the dashboard.','Each CMS has its own independent account. Save new credentials in a password manager; do not share them in chat.','Temporary credentials stop working after replacement. Delete or securely archive this file after handover.','Hosted links must be verified separately before remote client use.'].join('\r\n');
 const output=path.join(directory,'CLIENT-CMS-ACCESS.txt');await writeFile(output,text,{mode:0o600});console.log(JSON.stringify({provisioned:records.map(a=>a.site),mandatorySetupVerified:true,handoverFile:output,passwordsLogged:false}));
}else throw new Error('Use prepare or provision');
