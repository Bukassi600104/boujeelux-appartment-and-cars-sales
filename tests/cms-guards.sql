-- Run against the approved test project after QA accounts have been provisioned.
-- All test mutations roll back; no client account or website content is changed.
begin;
do $$
declare a public.cms_accounts; s public.cms_sessions; d public.cms_documents;
 result jsonb; fake_key text;
begin
 for a in select * from public.cms_accounts where username in ('chida-qa-new','boujeelux-qa-new') loop
  select * into s from public.cms_sessions where user_id=a.user_id and scope='full' order by expires_at desc limit 1;
  if s.token_hash is null then raise exception 'QA session required for %',a.site;end if;
  select * into d from public.cms_documents where site=a.site;
  if public.cms_lock_session(a.site,s.token_hash) is null then raise exception 'Valid QA session was refused';end if;
  if public.cms_lock_session(case when a.site='chida' then 'boujeelux' else 'chida' end,s.token_hash) is not null then raise exception 'Cross-site database access permitted';end if;
  -- This is the state a previously authorized request sees after revocation.
  update public.cms_accounts set epoch=epoch+1 where user_id=a.user_id;
  delete from public.cms_sessions where user_id=a.user_id;
  result:=public.cms_save_document_guarded(a.site,s.token_hash,d.revision,d.content,d.published);
  if result->>'authorized'<>'false' then raise exception 'Revoked request saved content';end if;
  if public.cms_update_enquiry_status_guarded(a.site,s.token_hash,gen_random_uuid(),'Closed')<>'unauthorized' then raise exception 'Revoked request updated enquiry';end if;
  fake_key:=gen_random_uuid()::text||'.png';
  if public.cms_register_media_guarded(a.site,s.token_hash,fake_key,'revoked test','image/png',10) then raise exception 'Revoked request registered media';end if;
  if public.cms_new_session(a.user_id,a.site,a.epoch,repeat('a',64)) then raise exception 'Old credential epoch minted a session';end if;
  if exists(select 1 from public.cms_documents where site=a.site and revision<>d.revision) then raise exception 'Revoked request changed revision';end if;
 end loop;
 if (select count(*) from public.cms_accounts where username in ('chida-qa-new','boujeelux-qa-new'))<>2 then raise exception 'Both QA accounts must be present';end if;
end $$;
select true as database_guard_assertions_passed;
rollback;
