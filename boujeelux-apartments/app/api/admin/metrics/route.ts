import {NextResponse} from 'next/server';
import {backend,sessionToken} from '@/lib/cms-server';

export async function GET(){const token=await sessionToken();if(!token)return NextResponse.json({error:'Authentication required.'},{status:401});try{const result=await backend('metrics',{},token);return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});}catch(error){const status=typeof error==='object'&&error&&'status'in error?Number(error.status):502;return NextResponse.json({error:error instanceof Error?error.message:'Could not load metrics.'},{status});}}
