import {authorize,apiError} from '@/lib/cms/access';
import {cmsRequest,CmsRemoteError} from '@/lib/cms/remote';
export async function GET(request:Request){try{const {token}=await authorize(),period=new URL(request.url).searchParams.get('period')??'daily';if(!['daily','weekly','monthly','yearly'].includes(period))throw new CmsRemoteError('Choose a valid reporting period.',400);return Response.json(await cmsRequest('clickReport',{period},token),{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
