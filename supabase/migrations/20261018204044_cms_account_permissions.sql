-- Existing support/client accounts keep their current access. Future direct
-- inserts default to editor; bootstrap explicitly provisions the initial owner.
alter table public.cms_accounts add column role text not null default 'owner'
 check(role in ('owner','editor','viewer'));
alter table public.cms_accounts alter column role set default 'editor';
alter table public.cms_accounts add column manage_listings boolean not null default true;
alter table public.cms_accounts add column manage_media boolean not null default true;
alter table public.cms_accounts add column manage_website_settings boolean not null default false;
alter table public.cms_accounts add column publish_content boolean not null default false;
alter table public.cms_documents add column published_at timestamptz;
alter table public.cms_events add column actor_name text;
alter table public.cms_events add column action_label text;
alter table public.cms_events add column item_name text;
alter table public.cms_events add column result_label text;

-- All security changes and guarded operations take the same site lock before
-- account locks. Concurrent demotions cannot each remove the final owner.
create or replace function public.cms_lock_session(p_site text,p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare uid uuid; a public.cms_accounts; s public.cms_sessions;
begin
 if p_site not in ('chida','boujeelux') then return null;end if;
 perform pg_advisory_xact_lock(hashtextextended('cms-security:'||p_site,0));
 select user_id into uid from public.cms_sessions where token_hash=p_hash and site=p_site;
 if uid is null then return null;end if;
 select * into a from public.cms_accounts where user_id=uid for update;
 select * into s from public.cms_sessions where token_hash=p_hash and user_id=uid and site=p_site;
 if a.user_id is null or s.user_id is null or a.site<>p_site or a.state<>'active' or a.must_change or a.role not in ('owner','editor','viewer') or s.scope<>'full' or s.epoch<>a.epoch or s.expires_at<=now() or s.last_seen<=now()-interval '30 minutes' then return null;end if;
 return uid;
end $$;

create function public.cms_effective_permissions(p_user uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('manageListings',role='owner' or role='editor' and manage_listings,'manageMedia',role='owner' or role='editor' and manage_media,'manageWebsiteSettings',role='owner' or role='editor' and manage_website_settings,'publishContent',role='owner' or role='editor' and publish_content) from public.cms_accounts where user_id=p_user;
$$;
create function public.cms_valid_grants(p_grants jsonb) returns boolean
language sql immutable security invoker set search_path='' as $$
 select p_grants is null or case when jsonb_typeof(p_grants)='object' then not exists(select 1 from jsonb_each(p_grants) e where e.key not in ('manageListings','manageMedia','manageWebsiteSettings','publishContent') or jsonb_typeof(e.value)<>'boolean') else false end;
$$;
create function public.cms_write_session(p_site text,p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare uid uuid;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null or not exists(select 1 from public.cms_accounts where user_id=uid and (role='owner' or role='editor' and (manage_listings or manage_media or manage_website_settings))) then return null;end if;
 return uid;
end $$;
create function public.cms_owner_session(p_site text,p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare uid uuid;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null or not exists(select 1 from public.cms_accounts where user_id=uid and role='owner') then return null;end if;
 return uid;
end $$;

create function public.cms_list_administrators(p_site text,p_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; accounts jsonb;
begin
 uid:=public.cms_owner_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false);end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'username',username,'role',role,'state',state,'mustChange',must_change,'createdAt',created_at,'permissions',public.cms_effective_permissions(user_id)) order by created_at,username),'[]'::jsonb)
 into accounts from public.cms_accounts where site=p_site;
 return jsonb_build_object('authorized',true,'accounts',accounts);
end $$;
create function public.cms_create_administrator(p_site text,p_hash text,p_user uuid,p_username text,p_role text,p_permissions jsonb default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; person text;
begin
 uid:=public.cms_owner_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false);end if;
 if p_role is null or p_role not in ('owner','editor','viewer') or p_username is null or p_username!~'^[a-z][a-z0-9._-]{3,39}$' or p_user is null or not public.cms_valid_grants(p_permissions) then return jsonb_build_object('authorized',true,'result','invalid');end if;
 if exists(select 1 from public.cms_accounts where site=p_site and (username=p_username or next_username=p_username)) then return jsonb_build_object('authorized',true,'result','duplicate');end if;
 insert into public.cms_accounts(user_id,site,username,role,must_change,state,manage_listings,manage_media,manage_website_settings,publish_content) values(p_user,p_site,p_username,p_role,true,'active',coalesce((p_permissions->>'manageListings')::boolean,true),coalesce((p_permissions->>'manageMedia')::boolean,true),coalesce((p_permissions->>'manageWebsiteSettings')::boolean,false),coalesce((p_permissions->>'publishContent')::boolean,false));
 select username into person from public.cms_accounts where user_id=uid;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Created administrator','Added administrator',p_username,'First sign-in setup required');
 return jsonb_build_object('authorized',true,'result','ok');
end $$;
create function public.cms_update_administrator(p_site text,p_hash text,p_user uuid,p_role text default null,p_state text default null,p_permissions jsonb default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; target public.cms_accounts; next_role text; next_state text; person text; next_listings boolean; next_media boolean; next_settings boolean; next_publish boolean;
begin
 uid:=public.cms_owner_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false);end if;
 if p_role is not null and p_role not in ('owner','editor','viewer') or p_state is not null and p_state not in ('active','disabled') or p_role is null and p_state is null and p_permissions is null or not public.cms_valid_grants(p_permissions) then return jsonb_build_object('authorized',true,'result','invalid');end if;
 select * into target from public.cms_accounts where user_id=p_user and site=p_site for update;
 if target.user_id is null then return jsonb_build_object('authorized',true,'result','missing');end if;
 if target.state='rotating' then return jsonb_build_object('authorized',true,'result','rotating');end if;
 next_role:=coalesce(p_role,target.role);next_state:=coalesce(p_state,target.state);
 next_listings:=coalesce((p_permissions->>'manageListings')::boolean,case when next_role<>target.role then true else target.manage_listings end);
 next_media:=coalesce((p_permissions->>'manageMedia')::boolean,case when next_role<>target.role then true else target.manage_media end);
 next_settings:=coalesce((p_permissions->>'manageWebsiteSettings')::boolean,case when next_role<>target.role then false else target.manage_website_settings end);
 next_publish:=coalesce((p_permissions->>'publishContent')::boolean,case when next_role<>target.role then false else target.publish_content end);
 if target.role='owner' and target.state='active' and (next_role<>'owner' or next_state<>'active') and not exists(select 1 from public.cms_accounts where site=p_site and user_id<>p_user and role='owner' and state='active') then return jsonb_build_object('authorized',true,'result','last_owner');end if;
 if next_role<>target.role or next_state<>target.state or next_listings<>target.manage_listings or next_media<>target.manage_media or next_settings<>target.manage_website_settings or next_publish<>target.publish_content then
  update public.cms_accounts set role=next_role,state=next_state,manage_listings=next_listings,manage_media=next_media,manage_website_settings=next_settings,publish_content=next_publish,epoch=epoch+1 where user_id=p_user;
  delete from public.cms_sessions where user_id=p_user;
  select username into person from public.cms_accounts where user_id=uid;
  insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Updated administrator access','Changed administrator access',target.username,case when next_state='disabled' then 'Access disabled; signed out' else 'Access updated; sign-in required' end);
 end if;
 return jsonb_build_object('authorized',true,'result','ok');
end $$;

create or replace function public.cms_new_session(p_user uuid,p_site text,p_epoch integer,p_hash text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare a public.cms_accounts;
begin
 select * into a from public.cms_accounts where user_id=p_user and site=p_site for update;
 if a.user_id is null or a.state<>'active' or a.epoch<>p_epoch or a.role not in ('owner','editor','viewer') then return false;end if;
 delete from public.cms_sessions where expires_at<now() or last_seen<now()-interval '30 minutes';
 insert into public.cms_sessions(token_hash,user_id,site,scope,epoch,expires_at) values(p_hash,p_user,p_site,case when a.must_change then 'setup' else 'full' end,a.epoch,now()+case when a.must_change then interval '15 minutes' else interval '8 hours' end);
 return true;
end $$;
create or replace function public.cms_begin_rotation(p_user uuid,p_hash text,p_username text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare a public.cms_accounts; s public.cms_sessions; lease uuid; website text;
begin
 select site into website from public.cms_accounts where user_id=p_user;
 if website is null then return null;end if;
 perform pg_advisory_xact_lock(hashtextextended('cms-security:'||website,0));
 select * into a from public.cms_accounts where user_id=p_user for update;
 select * into s from public.cms_sessions where token_hash=p_hash and user_id=p_user and site=a.site;
 if a.state<>'active' or a.role not in ('owner','editor','viewer') or s.token_hash is null or s.epoch<>a.epoch or s.expires_at<=now() or s.last_seen<=now()-interval '30 minutes' or (a.must_change and s.scope<>'setup') or (not a.must_change and s.scope<>'full') or p_username is null or p_username!~'^[a-z][a-z0-9._-]{3,39}$' or p_username=a.username then return null;end if;
 if exists(select 1 from public.cms_accounts where site=a.site and (username=p_username or next_username=p_username)) then return null;end if;
 lease:=gen_random_uuid();
 update public.cms_accounts set state='rotating',epoch=epoch+1,next_username=p_username,rotation_lease=lease where user_id=p_user;
 delete from public.cms_sessions where user_id=p_user;
 return lease;
end $$;
create function public.cms_begin_password_change(p_site text,p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare uid uuid; lease uuid;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null then return null;end if;
 lease:=gen_random_uuid();
 update public.cms_accounts set state='rotating',epoch=epoch+1,next_username=username,rotation_lease=lease where user_id=uid;
 delete from public.cms_sessions where user_id=uid;
 return lease;
end $$;
create or replace function public.cms_finish_rotation(p_user uuid,p_username text,p_lease uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
declare website text; previous text; was_setup boolean;
begin
 select site into website from public.cms_accounts where user_id=p_user;
 if website is null then return false;end if;
 perform pg_advisory_xact_lock(hashtextextended('cms-security:'||website,0));
 select username,must_change into previous,was_setup from public.cms_accounts where user_id=p_user for update;
 update public.cms_accounts set username=p_username,must_change=false,state='active',next_username=null,rotation_lease=null where user_id=p_user and state='rotating' and next_username=p_username and rotation_lease=p_lease;
 if not found then return false;end if;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(website,p_user::text,p_username,'Administrator credentials changed; all sessions revoked',case when was_setup then 'Completed first sign-in setup' when previous=p_username then 'Changed password' else 'Changed sign-in details' end,p_username,'Signed out; sign-in required');
 return true;
end $$;

-- Apartment record version/draft metadata is not a public change. Compare only
-- the visible published apartment snapshots when identifying publication.
create function public.cms_visible_payload(p_site text,p_content jsonb) returns jsonb
language sql immutable security invoker set search_path='' as $$
 select case when p_site='boujeelux' then coalesce((select jsonb_agg(r->'published' order by r->>'id') from jsonb_array_elements(coalesce(p_content->'records','[]'::jsonb)) r where r->'published'<>'null'::jsonb),'[]'::jsonb) else p_content end;
$$;
create function public.cms_changed_item(p_site text,p_before jsonb,p_after jsonb) returns text
language plpgsql immutable security invoker set search_path='' as $$
declare names text[]; n integer;
begin
 if p_site='chida' then
  select array_agg(coalesce(a->>'name',b->>'name') order by coalesce(a->>'slug',b->>'slug')) into names
  from jsonb_array_elements(coalesce(p_after->'vehicles','[]'::jsonb)) a full join jsonb_array_elements(coalesce(p_before->'vehicles','[]'::jsonb)) b on a->>'slug'=b->>'slug' where a is distinct from b;
 else
  select array_agg(coalesce(a->'draft'->>'name',b->'draft'->>'name') order by coalesce(a->>'id',b->>'id')) into names
  from jsonb_array_elements(coalesce(p_after->'records','[]'::jsonb)) a full join jsonb_array_elements(coalesce(p_before->'records','[]'::jsonb)) b on a->>'id'=b->>'id' where a is distinct from b;
 end if;
 n:=coalesce(array_length(names,1),0);
 if n=1 then return left(names[1],200);end if;
 if n>1 then return n::text||case when p_site='chida' then ' vehicles' else ' apartments' end;end if;
 return 'Website settings';
end $$;
create or replace function public.cms_save_document_guarded(p_site text,p_hash text,p_revision integer,p_content jsonb,p_published jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; d public.cms_documents; previous public.cms_documents; changed_public boolean; person text; item text; grants jsonb;
begin
 uid:=public.cms_write_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false,'saved',false);end if;
 select * into previous from public.cms_documents where site=p_site for update;
 if previous.revision<>p_revision then return jsonb_build_object('authorized',true,'saved',false);end if;
 grants:=public.cms_effective_permissions(uid);
 if ((previous.content->'settings' is distinct from p_content->'settings') and not (grants->>'manageWebsiteSettings')::boolean) or ((previous.content->case when p_site='chida' then 'vehicles' else 'records' end is distinct from p_content->case when p_site='chida' then 'vehicles' else 'records' end) and not (grants->>'manageListings')::boolean) then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 -- The original save action cannot be used as a car publication bypass.
 if p_site='chida' then p_published:=previous.published;end if;
 changed_public:=public.cms_visible_payload(p_site,previous.published) is distinct from public.cms_visible_payload(p_site,p_published);
 if changed_public and (not (grants->>'publishContent')::boolean or not (grants->>'manageListings')::boolean) then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 item:=public.cms_changed_item(p_site,previous.content,p_content);
 update public.cms_documents set content=p_content,published=p_published,revision=revision+1,updated_at=now(),published_at=case when changed_public then now() else published_at end where site=p_site returning * into d;
 select username into person from public.cms_accounts where user_id=uid;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Saved website content',case when changed_public then 'Updated website publication' else 'Saved draft changes' end,item,case when changed_public then 'Website updated' else 'Saved; public content unchanged' end);
 return jsonb_build_object('authorized',true,'saved',true,'content',d.content,'published',d.published,'published_at',d.published_at,'revision',d.revision,'updated_at',d.updated_at);
end $$;
create function public.cms_save_draft_guarded(p_site text,p_hash text,p_revision integer,p_content jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
 if p_site<>'chida' then return jsonb_build_object('authorized',false,'saved',false);end if;
 return public.cms_save_document_guarded(p_site,p_hash,p_revision,p_content,null);
end $$;
create function public.cms_publish_document_guarded(p_site text,p_hash text,p_revision integer,p_published jsonb,p_scope text,p_slug text default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; previous public.cms_documents; d public.cms_documents; grants jsonb; settings_changed boolean; vehicles_changed boolean; before_others jsonb; after_others jsonb; person text; item text;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null or p_site<>'chida' then return jsonb_build_object('authorized',false,'saved',false);end if;
 grants:=public.cms_effective_permissions(uid);
 if not (grants->>'publishContent')::boolean then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 select * into previous from public.cms_documents where site=p_site for update;
 if previous.revision<>p_revision then return jsonb_build_object('authorized',true,'saved',false);end if;
 settings_changed:=previous.published->'settings' is distinct from p_published->'settings';
 vehicles_changed:=previous.published->'vehicles' is distinct from p_published->'vehicles';
 if settings_changed and not (grants->>'manageWebsiteSettings')::boolean or vehicles_changed and not (grants->>'manageListings')::boolean then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 if p_scope not in ('website','vehicle','all') or p_scope is null or p_scope='website' and vehicles_changed or p_scope='vehicle' and (settings_changed or p_slug is null or p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$') then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 if p_scope='vehicle' then
  select coalesce(jsonb_agg(v order by ordinal),'[]'::jsonb) into before_others from jsonb_array_elements(coalesce(previous.published->'vehicles','[]'::jsonb)) with ordinality t(v,ordinal) where v->>'slug'<>p_slug;
  select coalesce(jsonb_agg(v order by ordinal),'[]'::jsonb) into after_others from jsonb_array_elements(coalesce(p_published->'vehicles','[]'::jsonb)) with ordinality t(v,ordinal) where v->>'slug'<>p_slug;
  if before_others is distinct from after_others then return jsonb_build_object('authorized',true,'saved',false,'forbidden',true);end if;
 end if;
 update public.cms_documents set published=p_published,revision=revision+1,updated_at=now(),published_at=now() where site=p_site returning * into d;
 select username into person from public.cms_accounts where user_id=uid;
 item:=case when p_scope='website' then 'Website settings' when p_scope='vehicle' then coalesce((select v->>'name' from jsonb_array_elements(coalesce(p_published->'vehicles','[]'::jsonb)) v where v->>'slug'=p_slug),p_slug) else 'Website and vehicle collection' end;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Published saved website changes','Published to website',left(item,200),'Website updated');
 return jsonb_build_object('authorized',true,'saved',true,'content',d.content,'published',d.published,'published_at',d.published_at,'revision',d.revision,'updated_at',d.updated_at);
end $$;
create or replace function public.cms_update_enquiry_status_guarded(p_site text,p_hash text,p_id uuid,p_status text) returns text
language plpgsql security invoker set search_path='' as $$
declare uid uuid; person text; kind text;
begin
 uid:=public.cms_write_session(p_site,p_hash);
 if uid is null then return 'unauthorized';end if;
 if not (public.cms_effective_permissions(uid)->>'manageListings')::boolean then return 'unauthorized';end if;
 if p_status not in ('New','Contacted','Pending confirmation','Confirmed','Closed') then return 'invalid';end if;
 update public.cms_enquiries set status=p_status where site=p_site and id=p_id returning type into kind;
 if not found then return 'missing';end if;
 select username into person from public.cms_accounts where user_id=uid;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Updated enquiry status','Updated enquiry',kind||' enquiry',p_status);
 return 'ok';
end $$;
create or replace function public.cms_register_media_guarded(p_site text,p_hash text,p_key text,p_name text,p_type text,p_size integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare uid uuid; person text;
begin
 uid:=public.cms_write_session(p_site,p_hash);
 if uid is null then return false;end if;
 if not (public.cms_effective_permissions(uid)->>'manageMedia')::boolean then return false;end if;
 insert into public.cms_media_objects(key,site,name,type,size) values(p_key,p_site,p_name,p_type,p_size);
 select username into person from public.cms_accounts where user_id=uid;
 insert into public.cms_events(site,actor,actor_name,action,action_label,item_name,result_label) values(p_site,uid::text,person,'Uploaded media','Uploaded photo',left(p_name,200),'Added to photo library');
 return true;
end $$;

revoke all on function public.cms_effective_permissions(uuid),public.cms_valid_grants(jsonb),public.cms_write_session(text,text),public.cms_owner_session(text,text),public.cms_list_administrators(text,text),public.cms_create_administrator(text,text,uuid,text,text,jsonb),public.cms_update_administrator(text,text,uuid,text,text,jsonb),public.cms_begin_password_change(text,text),public.cms_visible_payload(text,jsonb),public.cms_changed_item(text,jsonb,jsonb),public.cms_save_draft_guarded(text,text,integer,jsonb),public.cms_publish_document_guarded(text,text,integer,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.cms_effective_permissions(uuid),public.cms_valid_grants(jsonb),public.cms_write_session(text,text),public.cms_owner_session(text,text),public.cms_list_administrators(text,text),public.cms_create_administrator(text,text,uuid,text,text,jsonb),public.cms_update_administrator(text,text,uuid,text,text,jsonb),public.cms_begin_password_change(text,text),public.cms_visible_payload(text,jsonb),public.cms_changed_item(text,jsonb,jsonb),public.cms_save_draft_guarded(text,text,integer,jsonb),public.cms_publish_document_guarded(text,text,integer,jsonb,text,text) to service_role;
-- Replaced functions retain their original service_role-only grants.
