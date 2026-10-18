import {apiError,authorize} from "@/lib/cms/access";
import {cmsRequest} from "@/lib/cms/remote";
export async function GET(){try{const {token}=await authorize();return Response.json(await cmsRequest("metrics",{},token),{headers:{"Cache-Control":"no-store"}});}catch(error){return apiError(error);}}
