import {CmsError,username,password,validateRotation,validateContent,publicProjection,decodeMedia,mediaKey} from './validation.mjs';
export async function sha256(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export function randomToken(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
async function boundedBucket(value,size){const digest=await sha256(String(value));return Number.parseInt(digest.slice(0,8),16)%size;}
// At the Edge, only the rightmost forwarded hop is treated as a coarse gateway
// identity. It is intentionally aggregated and is never treated as a verified
// end-user IP address.
export async function rateLimitKeys(kind,site,identity='',forwarded=''){
 const gateway=String(forwarded??'').split(',').at(-1)?.trim().slice(0,128)||'gateway';
 if(kind==='login')return [
  {key:`login:global:${site}`,limit:1000,seconds:900},
  {key:`login:account:${await boundedBucket(identity,1024)}:${site}`,limit:30,seconds:900},
  {key:`login:pair:${await boundedBucket(`${identity}\0${gateway}`,1024)}:${site}`,limit:5,seconds:900},
 ];
 if(kind==='enquire')return [
  {key:`enquire:global:${site}`,limit:1000,seconds:60},
  {key:`enquire:source:${await boundedBucket(gateway,1024)}:${site}`,limit:10,seconds:60},
 ];
 return [
  {key:`chat:global:${site}`,limit:5000,seconds:60},
  {key:`chat:source:${await boundedBucket(gateway,1024)}:${site}`,limit:30,seconds:60},
 ];
}
async function enforceLimits(repo,entries,message){for(const entry of entries)if(!await repo.limit(entry.key,entry.limit,entry.seconds))throw new CmsError(message,429);}
const MAX_REQUEST_BYTES=4_400_000;
async function readBoundedText(request){
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_REQUEST_BYTES){await reader.cancel().catch(()=>{});throw new CmsError('Request is too large.',413);}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(bytes);
}
export async function authorizeSession(repo,site,token,allowSetup=false){if(typeof token!=='string'||! /^[A-Za-z0-9_-]{43}$/.test(token))throw new CmsError('Please sign in to this CMS.',401);const row=await repo.session(await sha256(token));const now=Date.now();if(!row||row.site!==site||row.account?.site!==site||row.account.state!=='active'||row.epoch!==row.account.epoch||Date.parse(row.expires_at)<=now||Date.parse(row.last_seen)<now-30*60*1000)throw new CmsError('Please sign in to this CMS.',401);if(!allowSetup&&(row.scope!=='full'||row.account.must_change))throw new CmsError('Change both credentials before accessing the CMS.',428);await repo.touch?.(row.token_hash);return row;}
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function createHandler(repo){return async function handle(request){try{
 const url=new URL(request.url);if(request.method==='GET'){const site=url.searchParams.get('site'),key=url.searchParams.get('key');if(!['chida','boujeelux'].includes(site)||!mediaKey.test(key??''))throw new CmsError('Not found.',404);return await repo.media(site,key,request.headers.get('range'));}
 if(request.method!=='POST')throw new CmsError('Method not allowed.',405);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new CmsError('Use JSON.',415);if(Number(request.headers.get('content-length'))>MAX_REQUEST_BYTES)throw new CmsError('Request is too large.',413);const text=await readBoundedText(request);let b;try{b=JSON.parse(text);}catch{throw new CmsError('Invalid JSON.');}const {site,action}=b??{};if(!['chida','boujeelux'].includes(site)||typeof action!=='string')throw new CmsError('Invalid CMS request.');
 if(action==='publicContent'){return json(await repo.content(site,true));}
 // Bootstrap tokens stay deliberately single-use and fail closed. If Auth or DB
 // provisioning has an unknown outcome after the claim, an operator must first
 // verify that no site account was created before issuing a new setup token.
 if(action==='bootstrap'){const name=username(b.username),pass=password(b.password);if(typeof b.bootstrapToken!=='string'||! /^[A-Za-z0-9_-]{43}$/.test(b.bootstrapToken))throw new CmsError('Invalid setup authorization.',403);const claim=await repo.claimBootstrap(await sha256(b.bootstrapToken),site);if(!claim)throw new CmsError('Invalid or expired setup authorization.',403);await repo.provision(site,name,pass);return json({ok:true},201);}
 if(action==='login'){let name;try{name=username(b.username);}catch{throw new CmsError('Invalid username or password.',401);}if(typeof b.password!=='string'||new TextEncoder().encode(b.password).length>72)throw new CmsError('Invalid username or password.',401);await enforceLimits(repo,await rateLimitKeys('login',site,name,request.headers.get('x-forwarded-for')),'Too many attempts. Please wait 15 minutes.');const account=await repo.account(site,name);const valid=await repo.verifyPassword(account,b.password);if(!valid||!account||account.state!=='active')throw new CmsError('Invalid username or password.',401);const token=randomToken();await repo.createSession(account,await sha256(token));return json({token,mustChange:account.must_change,username:account.username});}
 if(action==='enquire'){await enforceLimits(repo,await rateLimitKeys('enquire',site,'',request.headers.get('x-forwarded-for')),'Please wait a minute before another enquiry.');const payload=b.payload;if(!payload||typeof payload!=='object'||Array.isArray(payload)||JSON.stringify(payload).length>6000)throw new CmsError('Invalid enquiry.');if(site==='chida'){if(!['Sales','Sourcing','Inspection'].includes(b.type)||typeof payload.message!=='string'||payload.message.trim().length<5||payload.message.length>2500)throw new CmsError('Invalid enquiry.');const {content}=await repo.content(site,true);if(b.type==='Inspection'&&content?.settings.inspectionEnabled===false||b.type==='Sourcing'&&content?.settings.sourcingEnabled===false)throw new CmsError('This service is currently paused.',409);}else if(b.type!=='Apartment')throw new CmsError('Invalid enquiry.');return json(await repo.enquire(site,b.type,payload),201);}
 if(action==='trackChat'){if(typeof b.listingSlug!=='string'||b.listingSlug.length>100||b.listingSlug!==''&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.listingSlug)||Object.hasOwn(b,'count'))throw new CmsError('Invalid chat activity.');await enforceLimits(repo,await rateLimitKeys('trackChat',site,'',request.headers.get('x-forwarded-for')),'Too many chat actions. Please wait a minute.');if(b.listingSlug){const {content}=await repo.content(site,true);const exists=site==='chida'?content?.vehicles?.some(v=>v.slug===b.listingSlug&&(!v.status||v.status==='published')):content?.records?.some(r=>r.published?.slug===b.listingSlug);if(!exists)throw new CmsError('Listing not found.',404);}return json(await repo.trackChat(site,b.listingSlug),201);}
 const session=await authorizeSession(repo,site,b.token,['session','rotate','logout'].includes(action));const account=session.account;
 if(action==='session')return json({username:account.username,mustChange:account.must_change});
 if(action==='logout'){await repo.logout(session.token_hash);return json({ok:true});}
 if(action==='rotate'){if(typeof b.currentPassword!=='string'||!await repo.verifyPassword(account,b.currentPassword))throw new CmsError('The current password is incorrect.',401);const next=validateRotation(b,account.username,b.currentPassword);if(await repo.account(site,next.username))throw new CmsError('This username is unavailable.',409);const lease=await repo.beginRotation(account.user_id,session.token_hash,next.username);if(!lease)throw new CmsError('This account changed. Please sign in again.',409);try{await repo.changePassword(account.user_id,next.password);await repo.finishRotation(account.user_id,next.username,lease);}catch{throw new CmsError('Credential change could not finish. Access is locked; contact your administrator for recovery.',503);}return json({ok:true});}
 if(action==='content')return json(await repo.content(site,false));
 if(action==='save'){if(!Number.isSafeInteger(b.revision)||b.revision<0)throw new CmsError('Invalid revision.');const content=validateContent(site,b.content);await repo.validateMedia(site,content);return json(await repo.save(site,b.revision,content,publicProjection(site,content),account.user_id,session.token_hash));}
 if(action==='upload'){const media=decodeMedia(b);return json(await repo.upload(site,{...media,type:b.type,actor:account.user_id},session.token_hash),201);}
 if(action==='mediaList')return json(await repo.mediaList(site));
 if(action==='enquiries')return json(await repo.enquiries(site));
 if(action==='status'){if(typeof b.id!=='string'||! /^[a-f0-9-]{36}$/.test(b.id)||!['New','Contacted','Pending confirmation','Confirmed','Closed'].includes(b.status))throw new CmsError('Invalid enquiry status.');return json(await repo.status(site,b.id,b.status,account.user_id,session.token_hash));}
 if(action==='audit')return json(await repo.audit(site));
 if(action==='metrics')return json(await repo.metrics(site,session.token_hash));
 throw new CmsError('Unknown CMS action.',404);
 }catch(error){if(error instanceof CmsError)return json({error:error.message},error.status);return json({error:'CMS service is temporarily unavailable. Please try again.'},503);}};}
