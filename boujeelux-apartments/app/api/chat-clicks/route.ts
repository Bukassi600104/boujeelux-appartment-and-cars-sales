import {NextResponse} from 'next/server';
import {backend} from '@/lib/cms-server';
import {isSameOrigin,readBoundedJsonObject} from '@/lib/cms-contract';
import {validListingSlug} from '@/lib/refinements';

export async function POST(request:Request){
  if(!isSameOrigin(request.headers.get('origin'),request.url))return NextResponse.json({error:'Same-origin request required.'},{status:403});
  if(Number(request.headers.get('content-length')||0)>1_000)return NextResponse.json({error:'Request is too large.'},{status:413});
  let data:Record<string,unknown>;try{data=await readBoundedJsonObject(request,1_000);}catch(error){const message=error instanceof Error?error.message:'Invalid JSON.';return NextResponse.json({error:message},{status:message==='Request is too large.'?413:400});}if(!validListingSlug(data.listingSlug)||Object.keys(data).some(key=>key!=='listingSlug'))return NextResponse.json({error:'Enter a valid listing context.'},{status:400});
  try{await backend('trackChat',{listingSlug:(data as {listingSlug:string}).listingSlug});return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});}catch(error){const status=typeof error==='object'&&error&&'status'in error?Number(error.status):502;return NextResponse.json({error:error instanceof Error?error.message:'Could not record activity.'},{status});}
}
