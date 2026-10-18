import {cookies} from "next/headers";
import {sameOrigin} from "@/lib/cms/model";
import {cmsRequest,CmsRemoteError} from "@/lib/cms/remote";
export const SESSION_COOKIE="chida_cms_session";
export type CmsSession={username:string;mustChange:boolean};
export async function sessionToken(){return (await cookies()).get(SESSION_COOKIE)?.value??null;}
export async function adminIdentity():Promise<CmsSession|null>{const token=await sessionToken();if(!token)return null;try{return await cmsRequest<CmsSession>("session",{},token);}catch(error){if(error instanceof CmsRemoteError&&[401,403].includes(error.status))return null;throw error;}}
export async function authorize(request?:Request){if(request&&request.method!=="GET"&&!sameOrigin(request.headers.get("origin"),request.url))throw new CmsRemoteError("Cross-origin request rejected.",403);const token=await sessionToken();if(!token)throw new CmsRemoteError("Sign in to continue.",401);const session=await cmsRequest<CmsSession>("session",{},token);if(session.mustChange)throw new CmsRemoteError("Change your temporary credentials before continuing.",428);return {token,session};}
export function assertMutationOrigin(request:Request){if(!sameOrigin(request.headers.get("origin"),request.url))throw new CmsRemoteError("Cross-origin request rejected.",403);}
export async function readBoundedText(request:Request,maxBytes:number){const declared=Number(request.headers.get("content-length")||0);if(Number.isFinite(declared)&&declared>maxBytes)throw new CmsRemoteError("Request too large.",413);const text=await request.text();if(new TextEncoder().encode(text).length>maxBytes)throw new CmsRemoteError("Request too large.",413);return text;}
export function apiError(error:unknown){const status=error instanceof CmsRemoteError?error.status:400;const message=error instanceof Error?error.message:"Request failed";return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
