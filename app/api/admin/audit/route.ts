import {authorize,apiError} from "@/lib/cms/access";import {cmsRequest} from "@/lib/cms/remote";
export async function GET(){try{const {token}=await authorize();return Response.json(await cmsRequest("audit",{},token),{headers:{"Cache-Control":"no-store"}});}catch(e){return apiError(e);}}
