import {authorize,apiError,readBoundedText} from '@/lib/cms/access';
import {cmsRequest,CmsRemoteError} from '@/lib/cms/remote';
const headers={'Cache-Control':'no-store'};
export async function GET(){try{const {token,session}=await authorize();if(!session.permissions.manageAdmins)throw new CmsRemoteError('Only an owner can manage administrators.',403);return Response.json(await cmsRequest('administrators',{},token),{headers});}catch(error){return apiError(error);}}
async function mutate(request:Request,action:'createAdministrator'|'updateAdministrator'){
 try{const {token,session}=await authorize(request);if(!session.permissions.manageAdmins)throw new CmsRemoteError('Only an owner can manage administrators.',403);const data=JSON.parse(await readBoundedText(request,12000)) as unknown;if(!data||typeof data!=='object'||Array.isArray(data))throw new CmsRemoteError('Complete the administrator details.',400);
  const source=data as Record<string,unknown>,allowed=action==='createAdministrator'?['username','password','role','permissions','currentPassword']:['id','role','state','permissions','currentPassword'];
  if(Object.keys(source).some(key=>!allowed.includes(key)))throw new CmsRemoteError('Only administrator details can be changed here.',400);
  return Response.json(await cmsRequest(action,source,token),{status:action==='createAdministrator'?201:200,headers});
 }catch(error){return apiError(error);}
}
export async function POST(request:Request){return mutate(request,'createAdministrator');}
export async function PATCH(request:Request){return mutate(request,'updateAdministrator');}
