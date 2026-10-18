import {NextResponse} from 'next/server';
import {allowedCmsAction,CMS_COOKIE,isPlainObject,isSameOrigin,publicLoginResult,readBoundedText,secureSessionCookie,validRotateAcknowledgement,validateCredentials} from '@/lib/cms-contract';
import {backend,sessionToken} from '@/lib/cms-server';

const limits:Record<string,number>={upload:4_200_000,save:2_000_000,enquire:32_000};
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
  const {action}=await params;
  if(!allowedCmsAction(action))return NextResponse.json({error:'Unknown CMS action.'},{status:404});
  if(!isSameOrigin(request.headers.get('origin'),request.url))return NextResponse.json({error:'Same-origin request required.'},{status:403});
  const max=limits[action]??16_000;let text:string;try{text=await readBoundedText(request,max);}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Request is too large.'},{status:413});}
  let parsed:unknown;try{parsed=text?JSON.parse(text):{};}catch{return NextResponse.json({error:'Invalid JSON.'},{status:400});}if(!isPlainObject(parsed))return NextResponse.json({error:'JSON body must be an object.'},{status:400});const data=parsed;
  if(action==='rotate'){if(!validRotateAcknowledgement(data))return NextResponse.json({error:'Confirm that you securely saved both new credentials.'},{status:400});const errors=validateCredentials(String(data.username??''),String(data.password??''));if(errors.length)return NextResponse.json({error:errors.join(' ')},{status:400});}
  const token=action==='login'||action==='publicContent'||action==='enquire'?undefined:await sessionToken();
  try{const result=await backend(action,data,token);const response=NextResponse.json(action==='login'?publicLoginResult(result):result,{headers:{'Cache-Control':'no-store'}});
    const secure=secureSessionCookie(request.url);
    if(action==='login'&&typeof result.token==='string')response.cookies.set(CMS_COOKIE,result.token,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:60*60*12,priority:'high'});
    if(action==='logout'||action==='rotate')response.cookies.set(CMS_COOKIE,'',{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:0});
    return response;
  }catch(error){const status=typeof error==='object'&&error&&'status'in error?Number(error.status):502;return NextResponse.json({error:error instanceof Error?error.message:'CMS request failed.'},{status});}
}
