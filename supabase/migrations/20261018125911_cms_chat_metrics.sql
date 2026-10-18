-- Best-effort aggregate WhatsApp click counts. These are website clicks,
-- not unique visitors, messages, conversations, bookings or sales.
create table public.cms_chat_clicks (
 site text not null check(site in ('chida','boujeelux')),
 listing_slug text not null check(length(listing_slug)<=100 and (listing_slug='' or listing_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
 day date not null,
 count bigint not null check(count>0),
 primary key (site,listing_slug,day)
);
create index cms_chat_clicks_day_idx on public.cms_chat_clicks(day);
alter table public.cms_chat_clicks enable row level security;
revoke all on table public.cms_chat_clicks from public,anon,authenticated;
grant all on table public.cms_chat_clicks to service_role;

create function public.cms_track_chat(p_site text,p_slug text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare today date:=timezone('utc',now())::date;
begin
 if p_site not in ('chida','boujeelux') or p_slug is null or length(p_slug)>100 or (p_slug<>'' and p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$') then return false;end if;
 delete from public.cms_chat_clicks where day<today-400;
 insert into public.cms_chat_clicks(site,listing_slug,day,count) values(p_site,p_slug,today,1)
 on conflict (site,listing_slug,day) do update set count=public.cms_chat_clicks.count+1;
 return true;
end $$;

create function public.cms_chat_metrics(p_site text,p_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid; total bigint; grouped jsonb;
begin
 uid:=public.cms_lock_session(p_site,p_hash);
 if uid is null then return jsonb_build_object('authorized',false,'total',0,'byListing','[]'::jsonb);end if;
 select coalesce(sum(count),0) into total from public.cms_chat_clicks where site=p_site;
 select coalesce(jsonb_agg(jsonb_build_object('listingSlug',listing_slug,'count',count) order by count desc,listing_slug),'[]'::jsonb) into grouped
 from (select listing_slug,sum(count)::bigint as count from public.cms_chat_clicks where site=p_site group by listing_slug) totals;
 return jsonb_build_object('authorized',true,'total',total,'byListing',grouped);
end $$;

revoke all on function public.cms_track_chat(text,text),public.cms_chat_metrics(text,text) from public,anon,authenticated;
grant execute on function public.cms_track_chat(text,text),public.cms_chat_metrics(text,text) to service_role;
