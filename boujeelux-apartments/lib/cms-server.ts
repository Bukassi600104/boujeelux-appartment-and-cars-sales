import 'server-only';
import {cookies} from 'next/headers';
import {cmsEnvelope,CMS_COOKIE,CMS_ORIGIN,type CmsIdentity} from './cms-contract';
import {hostedCatalog,type Catalog} from './domain';

export async function backend(action:string,data:Record<string,unknown>={},token?:string){
  const response=await fetch(CMS_ORIGIN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cmsEnvelope(action,data,token)),cache:'no-store'});
  const result=await response.json().catch(()=>({error:'CMS returned an invalid response.'})) as Record<string,unknown>;
  if(!response.ok)throw Object.assign(new Error(typeof result.error==='string'?result.error:'CMS request failed.'),{status:response.status});
  return result;
}
export async function sessionToken(){return (await cookies()).get(CMS_COOKIE)?.value;}
export async function cmsSession(){const token=await sessionToken();if(!token)return null;try{return await backend('session',{},token) as CmsIdentity;}catch{return null;}}
export async function publicCatalog():Promise<Catalog>{const result=await backend('publicContent');return hostedCatalog(result.content);}
