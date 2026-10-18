-- Independent CMS data. No browser role can access these tables directly.
create table public.cms_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 site text not null check(site in ('chida','boujeelux')),
 username text not null check(username ~ '^[a-z][a-z0-9._-]{3,39}$'),
 must_change boolean not null default true,
 state text not null default 'active' check(state in ('active','rotating','disabled')),
 epoch integer not null default 1,
 next_username text, rotation_lease uuid,
 created_at timestamptz not null default now(), unique(site,username)
);
create table public.cms_sessions (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid not null references public.cms_accounts(user_id) on delete cascade,
 site text not null check(site in ('chida','boujeelux')),
 scope text not null check(scope in ('setup','full')), epoch integer not null,
 expires_at timestamptz not null, last_seen timestamptz not null default now()
);
create index cms_sessions_user_idx on public.cms_sessions(user_id);
create table public.cms_documents (
 site text primary key check(site in ('chida','boujeelux')), content jsonb,
 published jsonb, revision integer not null default 0, updated_at timestamptz
);
insert into public.cms_documents(site) values ('chida'),('boujeelux');
create table public.cms_media_objects (
 key text primary key, site text not null check(site in ('chida','boujeelux')),
 name text not null, type text not null, size integer not null check(size between 1 and 3145728),
 created_at timestamptz not null default now()
);
create index cms_media_site_idx on public.cms_media_objects(site,created_at desc);
create table public.cms_enquiries (
 id uuid primary key default gen_random_uuid(), site text not null check(site in ('chida','boujeelux')),
 type text not null check(type in ('Sales','Sourcing','Inspection','Apartment')), payload jsonb not null,
 status text not null default 'New' check(status in ('New','Contacted','Pending confirmation','Confirmed','Closed')),
 created_at timestamptz not null default now()
);
create index cms_enquiries_site_idx on public.cms_enquiries(site,created_at desc);
create table public.cms_events (
 id bigint generated always as identity primary key, site text not null check(site in ('chida','boujeelux')),
 actor text not null, action text not null, created_at timestamptz not null default now()
);
create index cms_events_site_idx on public.cms_events(site,created_at desc);
create table public.cms_rate_limits (key text primary key, count integer not null, reset_at timestamptz not null);
create table public.cms_bootstrap_tokens (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 site text not null check(site in ('chida','boujeelux')), expires_at timestamptz not null,
 used_at timestamptz
);
alter table public.cms_accounts enable row level security;
alter table public.cms_sessions enable row level security;
alter table public.cms_documents enable row level security;
alter table public.cms_media_objects enable row level security;
alter table public.cms_enquiries enable row level security;
alter table public.cms_events enable row level security;
alter table public.cms_rate_limits enable row level security;
alter table public.cms_bootstrap_tokens enable row level security;
revoke all on public.cms_accounts,public.cms_sessions,public.cms_documents,public.cms_media_objects,public.cms_enquiries,public.cms_events,public.cms_rate_limits,public.cms_bootstrap_tokens from anon,authenticated;
grant all on public.cms_accounts,public.cms_sessions,public.cms_documents,public.cms_media_objects,public.cms_enquiries,public.cms_events,public.cms_rate_limits,public.cms_bootstrap_tokens to service_role;
grant usage,select on sequence public.cms_events_id_seq to service_role;

-- SECURITY INVOKER and service_role-only: these never elevate a public caller.
create function public.cms_limit(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.cms_rate_limits(key,count,reset_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set count=case when cms_rate_limits.reset_at<=now() then 1 else cms_rate_limits.count+1 end,
 reset_at=case when cms_rate_limits.reset_at<=now() then now()+make_interval(secs=>p_seconds) else cms_rate_limits.reset_at end returning count into n;
 return n<=p_limit;
end $$;
create function public.cms_new_session(p_user uuid,p_site text,p_epoch integer,p_hash text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare a public.cms_accounts;
begin
 select * into a from public.cms_accounts where user_id=p_user and site=p_site for update;
 if a.user_id is null or a.state<>'active' or a.epoch<>p_epoch then return false;end if;
 delete from public.cms_sessions where expires_at<now() or last_seen<now()-interval '30 minutes';
 insert into public.cms_sessions(token_hash,user_id,site,scope,epoch,expires_at) values(p_hash,p_user,p_site,case when a.must_change then 'setup' else 'full' end,a.epoch,now()+case when a.must_change then interval '15 minutes' else interval '8 hours' end);
 return true;
end $$;
create function public.cms_begin_rotation(p_user uuid,p_hash text,p_username text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare a public.cms_accounts; lease uuid;
begin
 select * into a from public.cms_accounts where user_id=p_user for update;
 if a.state<>'active' or not exists(select 1 from public.cms_sessions where token_hash=p_hash and user_id=p_user and epoch=a.epoch and expires_at>now() and last_seen>now()-interval '30 minutes') then return null;end if;
 perform pg_advisory_xact_lock(hashtextextended(a.site||':'||p_username,0));
 if exists(select 1 from public.cms_accounts where site=a.site and (username=p_username or next_username=p_username)) then return null;end if;
 lease:=gen_random_uuid();
 update public.cms_accounts set state='rotating',epoch=epoch+1,next_username=p_username,rotation_lease=lease where user_id=p_user;
 delete from public.cms_sessions where user_id=p_user;
 return lease;
end $$;
create function public.cms_finish_rotation(p_user uuid,p_username text,p_lease uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
declare s text;
begin
 update public.cms_accounts set username=p_username,must_change=false,state='active',next_username=null,rotation_lease=null where user_id=p_user and state='rotating' and next_username=p_username and rotation_lease=p_lease returning site into s;
 if s is null then return false;end if;
 insert into public.cms_events(site,actor,action) values(s,p_user::text,'Administrator credentials changed; all sessions revoked');return true;
end $$;
create function public.cms_save_document(p_site text,p_revision integer,p_content jsonb,p_published jsonb,p_actor text) returns setof public.cms_documents
language plpgsql security invoker set search_path='' as $$
begin
 return query update public.cms_documents set content=p_content,published=p_published,revision=revision+1,updated_at=now() where site=p_site and revision=p_revision returning *;
 if found then insert into public.cms_events(site,actor,action) values(p_site,p_actor,'Saved website content');end if;
end $$;
create function public.cms_claim_bootstrap(p_hash text,p_site text) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 update public.cms_bootstrap_tokens set used_at=now() where token_hash=p_hash and site=p_site and used_at is null and expires_at>now();return found;
end $$;
revoke all on function public.cms_limit(text,integer,integer),public.cms_new_session(uuid,text,integer,text),public.cms_begin_rotation(uuid,text,text),public.cms_finish_rotation(uuid,text,uuid),public.cms_save_document(text,integer,jsonb,jsonb,text),public.cms_claim_bootstrap(text,text) from public,anon,authenticated;
grant execute on function public.cms_limit(text,integer,integer),public.cms_new_session(uuid,text,integer,text),public.cms_begin_rotation(uuid,text,text),public.cms_finish_rotation(uuid,text,uuid),public.cms_save_document(text,integer,jsonb,jsonb,text),public.cms_claim_bootstrap(text,text) to service_role;

-- Only sanitized, intentionally public vehicle/property media goes here. Uploads go through the authenticated Edge API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('dual-cms-public','dual-cms-public',true,3145728,array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']);
