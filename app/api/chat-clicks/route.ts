import {apiError,assertMutationOrigin,readBoundedText} from "@/lib/cms/access";
import {cmsRequest} from "@/lib/cms/remote";
import {validChatListingSlug} from "@/lib/cms/refinements";
export async function POST(request:Request){try{assertMutationOrigin(request);const parsed=JSON.parse(await readBoundedText(request,500)) as unknown;if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Invalid request.");const listingSlug=(parsed as {listingSlug?:unknown}).listingSlug;if(typeof listingSlug!=="string"||!validChatListingSlug(listingSlug))throw new Error("Choose a valid vehicle.");await cmsRequest("trackChat",{listingSlug});return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});}catch(error){return apiError(error);}}
