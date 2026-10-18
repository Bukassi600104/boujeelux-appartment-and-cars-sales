import {cookies} from "next/headers";
import {sameOrigin} from "@/lib/cms/model";
import {cmsRequest,CmsRemoteError} from "@/lib/cms/remote";
export {readBoundedText} from "@/lib/cms/bounded-body";
export const SESSION_COOKIE="chida_cms_session";
export type CmsSession={username:string;mustChange:boolean};
export async function sessionToken(){return (await cookies()).get(SESSION_COOKIE)?.value??null;}
export async function adminIdentity():Promise<CmsSession|null>{const token=await sessionToken();if(!token)return null;try{return await cmsRequest<CmsSession>("session",{},token);}catch(error){if(error instanceof CmsRemoteError&&[401,403].includes(error.status))return null;throw error;}}
export async function authorize(request?:Request){if(request&&request.method!=="GET"&&!sameOrigin(request.headers.get("origin"),request.url))throw new CmsRemoteError("Cross-origin request rejected.",403);const token=await sessionToken();if(!token)throw new CmsRemoteError("Sign in to continue.",401);const session=await cmsRequest<CmsSession>("session",{},token);if(session.mustChange)throw new CmsRemoteError("Change your temporary credentials before continuing.",428);return {token,session};}
export function assertMutationOrigin(request:Request){if(!sameOrigin(request.headers.get("origin"),request.url))throw new CmsRemoteError("Cross-origin request rejected.",403);}
export function apiError(error:unknown){const status=error instanceof CmsRemoteError?error.status:typeof error==="object"&&error&&"status" in error&&Number.isInteger(Number(error.status))?Number(error.status):400;const message=error instanceof Error?error.message:"Request failed";return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
