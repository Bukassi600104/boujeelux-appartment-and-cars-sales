export const CMS_COOKIE='boujeelux_cms_session';
export const CMS_ORIGIN='https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms';
const actions=new Set(['publicContent','login','session','rotate','logout','content','save','mediaList','upload','enquiries','status','audit','enquire']);
export function allowedCmsAction(value:string){return actions.has(value);}
export function isSameOrigin(origin:string|null,url:string){try{return !!origin&&new URL(origin).origin===new URL(url).origin;}catch{return false;}}
export function secureSessionCookie(url:string){const parsed=new URL(url);return parsed.protocol==='https:'||!['localhost','127.0.0.1','[::1]'].includes(parsed.hostname);}
export function isPlainObject(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value);}
export function cmsEnvelope(action:string,data:Record<string,unknown>,token?:string){const{site:_site,action:_action,token:_token,...safe}=data;return{...safe,site:'boujeelux',action,...(token?{token}:{})};}
export function publicLoginResult(result:Record<string,unknown>){return{mustChange:result.mustChange===true,username:typeof result.username==='string'?result.username:''};}
export function validateCredentials(username:string,password:string){const errors:string[]=[];if(!/^[A-Za-z][A-Za-z0-9._-]{3,39}$/.test(username))errors.push('Username must start with a letter and contain 4–40 letters, numbers, dots, underscores or hyphens.');const bytes=new TextEncoder().encode(password).length;if(password.length<15)errors.push('Password must be at least 15 characters.');if(bytes>72)errors.push('Password must be no more than 72 UTF-8 bytes.');return errors;}
