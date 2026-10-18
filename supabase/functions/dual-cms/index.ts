import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {createHandler} from './core.mjs';
import {SupabaseRepository} from './repository.mjs';
const url=Deno.env.get('SUPABASE_URL')!;
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const db=createClient(url,secret,options);
const repository=new SupabaseRepository(db,()=>createClient(url,secret,options));
// JWT gateway disabled deliberately: public content/login are anonymous; ALL private
// actions verify a site-scoped, hashed opaque session in core.mjs. No CORS cookies.
Deno.serve(createHandler(repository));
