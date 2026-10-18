-- Authoritative Postgres checks. Run only as a reviewed BEGIN/ROLLBACK batch.
-- Every account/document/Auth fixture change below is rolled back. No client
-- credential is read, replaced or returned; no messages are sent.
begin;
do $$
declare qa public.cms_accounts; d public.cms_documents; result jsonb; h text;
 fixture uuid; second_owner uuid; original_public jsonb; private_change jsonb;
 draft_pub jsonb; lease uuid; item text; before_epoch integer;
begin
 if (select count(*) from public.cms_accounts where (site='chida' and username like 'chida-qa-%') or (site='boujeelux' and username like 'boujeelux-qa-%'))<>2 then raise exception 'Exactly two designated QA accounts required';end if;
 for qa in select * from public.cms_accounts where (site='chida' and username like 'chida-qa-%') or (site='boujeelux' and username like 'boujeelux-qa-%') loop
  update public.cms_accounts set role='owner',state='active',must_change=false,epoch=epoch+1 where user_id=qa.user_id returning * into qa;
  h:=encode(gen_random_bytes(32),'hex');
  if not public.cms_new_session(qa.user_id,qa.site,qa.epoch,h) then raise exception 'QA session refused';end if;
  if public.cms_owner_session(qa.site,h)<>qa.user_id then raise exception 'Owner refused';end if;
  if public.cms_owner_session(case when qa.site='chida' then 'boujeelux' else 'chida' end,h) is not null then raise exception 'Cross-site access allowed';end if;
  fixture:=gen_random_uuid();insert into auth.users(id,email) values(fixture,fixture::text||'@rollback-test.invalid');
  result:=public.cms_create_administrator(qa.site,h,fixture,'rollback-editor','editor','{"manageListings":true,"manageMedia":false,"manageWebsiteSettings":false,"publishContent":false}');
  if result->>'result'<>'ok' then raise exception 'Owner creation failed';end if;
  if not exists(select 1 from public.cms_accounts where user_id=fixture and must_change and role='editor') then raise exception 'New administrator skipped mandatory setup';end if;
  result:=public.cms_list_administrators(qa.site,h);
  if result::text~'rotation_lease|next_username|password|token_hash' then raise exception 'Private account fields exposed';end if;
  if exists(select 1 from jsonb_array_elements(result->'accounts') a where a->>'id'=fixture::text and (a->'permissions'->>'manageMedia')::boolean) then raise exception 'Media grant ignored';end if;
  update public.cms_accounts set must_change=false where user_id=fixture;
  if not public.cms_new_session(fixture,qa.site,1,repeat('e',64)) then raise exception 'Editor session refused';end if;
  if public.cms_owner_session(qa.site,repeat('e',64)) is not null then raise exception 'Editor escalated to owner';end if;
  result:=public.cms_update_administrator(qa.site,repeat('e',64),qa.user_id,'viewer',null,null);
  if result->>'authorized'<>'false' then raise exception 'Editor changed owner';end if;
  if public.cms_register_media_guarded(qa.site,repeat('e',64),gen_random_uuid()::text||'.webp','rollback.webp','image/webp',12) then raise exception 'Media permission bypass';end if;
  select * into d from public.cms_documents where site=qa.site;
  original_public:=d.published;
  if qa.site='chida' then
   private_change:=jsonb_set(d.content,'{settings,heroTitle}','"Rollback draft headline"');
   result:=public.cms_save_draft_guarded(qa.site,repeat('e',64),d.revision,private_change);
   if result->>'forbidden'<>'true' then raise exception 'Listing editor changed website settings';end if;
   private_change:=jsonb_set(d.content,'{vehicles,0,name}','"Rollback saved vehicle edit"');
   result:=public.cms_save_draft_guarded(qa.site,repeat('e',64),d.revision,private_change);
   if result->>'saved'<>'true' then raise exception 'Listing draft save refused';end if;
   if (select published from public.cms_documents where site=qa.site) is distinct from original_public then raise exception 'Car draft save changed public site';end if;
   result:=public.cms_publish_document_guarded(qa.site,repeat('e',64),(result->>'revision')::integer,d.published,'all',null);
   if result->>'forbidden'<>'true' then raise exception 'Editor published without grant';end if;
   -- The legacy generic save action must not restore automatic car publication.
   select * into d from public.cms_documents where site=qa.site;
   result:=public.cms_save_document_guarded(qa.site,h,d.revision,d.content,jsonb_set(d.published,'{settings,heroTitle}','"Do not publish"'));
   if (select published from public.cms_documents where site=qa.site) is distinct from original_public then raise exception 'Legacy car autosave publication bypass';end if;
  else
   private_change:=jsonb_set(d.content,'{records,0,draft,name}','"Rollback saved apartment edit"');
   result:=public.cms_save_document_guarded(qa.site,repeat('e',64),d.revision,private_change,d.published);
   if result->>'saved'<>'true' then raise exception 'Apartment draft save refused';end if;
   select action_label into item from public.cms_events where site=qa.site order by id desc limit 1;
   if item<>'Saved draft changes' then raise exception 'Draft history falsely implied publishing';end if;
   select * into d from public.cms_documents where site=qa.site;
   draft_pub:=jsonb_set(d.published,'{records,0,published,name}','"Do not publish"');
   result:=public.cms_save_document_guarded(qa.site,repeat('e',64),d.revision,d.content,draft_pub);
   if result->>'forbidden'<>'true' then raise exception 'Apartment published without grant';end if;
   if (select published from public.cms_documents where site=qa.site) is distinct from original_public then raise exception 'Denied apartment publish changed content';end if;
  end if;
  select epoch into before_epoch from public.cms_accounts where user_id=fixture;
  result:=public.cms_update_administrator(qa.site,h,fixture,null,null,'{"manageMedia":true}');
  if result->>'result'<>'ok' then raise exception 'Owner permission update refused';end if;
  if exists(select 1 from public.cms_sessions where user_id=fixture) or (select epoch from public.cms_accounts where user_id=fixture)<>before_epoch+1 then raise exception 'Permission change did not revoke sessions';end if;
  update public.cms_accounts set role='viewer',must_change=false where user_id=fixture;
  select epoch into before_epoch from public.cms_accounts where user_id=fixture;
  if not public.cms_new_session(fixture,qa.site,before_epoch,repeat('d',64)) then raise exception 'Viewer session refused';end if;
  if public.cms_lock_session(qa.site,repeat('d',64)) is null or public.cms_write_session(qa.site,repeat('d',64)) is not null then raise exception 'Viewer read/write separation broken';end if;
  lease:=public.cms_begin_password_change(qa.site,repeat('d',64));
  if lease is null or exists(select 1 from public.cms_sessions where user_id=fixture) then raise exception 'Password change did not revoke sessions before Auth';end if;
  if public.cms_finish_rotation(fixture,'rollback-editor',gen_random_uuid()) then raise exception 'Forged rotation lease accepted';end if;
  if not public.cms_finish_rotation(fixture,'rollback-editor',lease) then raise exception 'Password-only finish failed';end if;
  if exists(select 1 from public.cms_sessions where user_id=fixture) then raise exception 'Password change automatically signed in';end if;
  -- Isolated transaction-only final-owner assertion. Other accounts are not
  -- changed persistently and the outer transaction must always roll back.
  update public.cms_accounts set state='disabled' where site=qa.site and role='owner' and user_id<>qa.user_id;
  result:=public.cms_update_administrator(qa.site,h,qa.user_id,'editor',null,null);
  if result->>'result'<>'last_owner' then raise exception 'Final owner demotion permitted';end if;
  result:=public.cms_update_administrator(qa.site,h,qa.user_id,null,'disabled',null);
  if result->>'result'<>'last_owner' then raise exception 'Final owner disable permitted';end if;
  delete from public.cms_sessions where token_hash in (repeat('e',64),repeat('d',64));
 end loop;
 if has_function_privilege('anon','public.cms_create_administrator(text,text,uuid,text,text,jsonb)','execute') or has_function_privilege('authenticated','public.cms_publish_document_guarded(text,text,integer,jsonb,text,text)','execute') then raise exception 'Browser role can call privileged account/publication RPC';end if;
end $$;
select true as account_permissions_and_publication_assertions_passed;
rollback;
