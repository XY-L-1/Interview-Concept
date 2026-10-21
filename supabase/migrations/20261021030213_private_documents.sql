create table public.private_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key in ('profile', 'studio', 'progress')),
  content jsonb not null check (octet_length(content::text) <= 2000000),
  version bigint not null default 1 check (version >= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.private_documents enable row level security;

revoke all on public.private_documents from public, anon, authenticated;
grant select on public.private_documents to authenticated;
grant update (content) on public.private_documents to authenticated;
grant all on public.private_documents to service_role;

create policy "Owner can read seeded documents"
  on public.private_documents for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owner can update seeded documents"
  on public.private_documents for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.bump_document_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  new.updated_at := pg_catalog.clock_timestamp();
  return new;
end;
$$;

revoke all on function private.bump_document_version() from public, anon, authenticated;

create trigger bump_document_version
  before update on public.private_documents
  for each row execute function private.bump_document_version();
