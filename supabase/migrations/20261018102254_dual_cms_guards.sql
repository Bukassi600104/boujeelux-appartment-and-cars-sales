-- Serialize mutable CMS operations with credential rotation and bound limiter storage.
create index if not exists cms_rate_limits_reset_idx on public.cms_rate_limits(reset_at);

create or replace function public.cms_limit(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.cms_rate_limits where reset_at<=now();
 insert into public.cms_rate_limits(key,count,reset_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set count=public.cms_rate_limits.count+1 returning count into n;
 return n<=p_limit;
end $$;

create function public.cms_lock_session(p_site text,p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare uid uuid; a public.cms_accounts; s public.cms_sessions;
begin
 select user_id into uid from public.cms_sessions where token_hash=p_hash and site=p_site;
 if uid is null then return null;end if;
 select * into a from public.cms_accounts where user_id=uid for update;
 select * into s from public.cms_sessions where token_hash=p_hash and user_id=uid and site=p_site;
 if a.user_id is null or s.user_id is null or a.site<>p_site or a.state<>'active' or a.must_change or s.scope<>'full' or s.epoch<>a.epoch or s.expires_at<=now() or s.last_seen<=now()-interval '30 minutes' then return null;end if;
 return uid;
end $$;

create function public.cms_save_document_guarded(p_site text,p_hash text,p_revision integer,p_content jsonb,p_published jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; d public.cms_documents;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false,'saved',false);end if;
 update public.cms_documents set content=p_content,published=p_published,revision=revision+1,updated_at=now() where site=p_site and revision=p_revision returning * into d;
 if d.site is null then return jsonb_build_object('authorized',true,'saved',false);end if;
 insert into public.cms_events(site,actor,action) values(p_site,uid::text,'Saved website content');
 return jsonb_build_object('authorized',true,'saved',true,'content',d.content,'revision',d.revision,'updated_at',d.updated_at);
end $$;

create function public.cms_update_enquiry_status_guarded(p_site text,p_hash text,p_id uuid,p_status text) returns text
language plpgsql security invoker set search_path='' as $$
declare uid uuid;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null then return 'unauthorized';end if;
 update public.cms_enquiries set status=p_status where site=p_site and id=p_id;
 if not found then return 'missing';end if;
 insert into public.cms_events(site,actor,action) values(p_site,uid::text,'Updated enquiry '||p_id::text||' to '||p_status);
 return 'ok';
end $$;

create function public.cms_register_media_guarded(p_site text,p_hash text,p_key text,p_name text,p_type text,p_size integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare uid uuid;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null then return false;end if;
 insert into public.cms_media_objects(key,site,name,type,size) values(p_key,p_site,p_name,p_type,p_size);
 insert into public.cms_events(site,actor,action) values(p_site,uid::text,'Uploaded media');
 return true;
end $$;

revoke all on function public.cms_lock_session(text,text),public.cms_save_document_guarded(text,text,integer,jsonb,jsonb),public.cms_update_enquiry_status_guarded(text,text,uuid,text),public.cms_register_media_guarded(text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.cms_lock_session(text,text),public.cms_save_document_guarded(text,text,integer,jsonb,jsonb),public.cms_update_enquiry_status_guarded(text,text,uuid,text),public.cms_register_media_guarded(text,text,text,text,text,integer) to service_role;
