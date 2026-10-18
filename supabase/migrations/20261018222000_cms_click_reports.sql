-- Detailed reporting begins here. Legacy daily aggregates are preserved, not
-- converted into invented hourly history. Counts are clicks, not people/leads.
create table public.cms_chat_reporting (site text primary key check(site in ('chida','boujeelux')),started_at timestamptz not null default now());
insert into public.cms_chat_reporting(site) values ('chida'),('boujeelux');
create table public.cms_chat_hourly (
 site text not null references public.cms_chat_reporting(site),
 listing_slug text not null check(length(listing_slug)<=100 and (listing_slug='' or listing_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
 bucket_start timestamptz not null,
 count bigint not null check(count>0),primary key(site,listing_slug,bucket_start)
);
alter table public.cms_chat_reporting enable row level security;
alter table public.cms_chat_hourly enable row level security;
revoke all on table public.cms_chat_reporting,public.cms_chat_hourly from public,anon,authenticated;
grant all on table public.cms_chat_reporting,public.cms_chat_hourly to service_role;
create or replace function public.cms_track_chat(p_site text,p_slug text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare hour_start timestamptz:=date_trunc('hour',now());
begin
 if p_site not in ('chida','boujeelux') or p_slug is null or length(p_slug)>100 or (p_slug<>'' and p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$') then return false;end if;
 delete from public.cms_chat_hourly where site=p_site and bucket_start<now()-interval '800 days';
 insert into public.cms_chat_hourly(site,listing_slug,bucket_start,count) values(p_site,p_slug,hour_start,1)
 on conflict(site,listing_slug,bucket_start) do update set count=public.cms_chat_hourly.count+1;
 return true;
end $$;
create or replace function public.cms_chat_metrics(p_site text,p_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid;total bigint;grouped jsonb;
begin
 uid:=public.cms_lock_session(p_site,p_hash);if uid is null then return jsonb_build_object('authorized',false);end if;
 select coalesce(sum(count),0) into total from public.cms_chat_hourly where site=p_site;
 select coalesce(jsonb_agg(jsonb_build_object('listingSlug',listing_slug,'count',count) order by count desc,listing_slug),'[]'::jsonb) into grouped from (select listing_slug,sum(count)::bigint as count from public.cms_chat_hourly where site=p_site group by listing_slug) q;
 return jsonb_build_object('authorized',true,'total',total,'byListing',grouped);
end $$;
create function public.cms_chat_report_data(p_site text,p_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid;started timestamptz;rows jsonb;legacy bigint;
begin
 uid:=public.cms_lock_session(p_site,p_hash);if uid is null then return jsonb_build_object('authorized',false);end if;
 select started_at into started from public.cms_chat_reporting where site=p_site;
 select coalesce(jsonb_agg(jsonb_build_object('bucketStart',bucket_start,'count',count) order by bucket_start),'[]'::jsonb) into rows from (select bucket_start,sum(count)::bigint count from public.cms_chat_hourly where site=p_site group by bucket_start) q;
 select coalesce(sum(count),0) into legacy from public.cms_chat_clicks where site=p_site;
 return jsonb_build_object('authorized',true,'startedAt',started,'buckets',rows,'legacyTotal',legacy);
end $$;
revoke all on function public.cms_track_chat(text,text),public.cms_chat_metrics(text,text),public.cms_chat_report_data(text,text) from public,anon,authenticated;
grant execute on function public.cms_track_chat(text,text),public.cms_chat_metrics(text,text),public.cms_chat_report_data(text,text) to service_role;
