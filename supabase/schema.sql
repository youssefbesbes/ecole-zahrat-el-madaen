-- Zahrat Al Madaeen — run once in Supabase: SQL Editor > New query > Run.
-- Visitors (anon key) can only INSERT requests. Only accounts listed in
-- public.admins can read them and change their follow-up status.

create extension if not exists pgcrypto;

-- ---------- requests from the website ----------
create table if not exists public.demandes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  type           text not null check (type in ('test', 'inscription')),
  statut         text not null default 'nouvelle'
                 check (statut in ('nouvelle', 'contactee', 'confirmee', 'inscrit', 'refusee')),
  session        text check (char_length(session) <= 60),
  enfant         text not null check (char_length(enfant) between 2 and 120),
  naissance      date not null check (naissance >= date '2010-01-01'),
  niveau         text not null check (char_length(niveau) <= 40),
  ecole_actuelle text check (char_length(ecole_actuelle) <= 200),
  parent         text not null check (char_length(parent) between 2 and 120),
  tel            text not null check (tel ~ '^(\+?216)?\s*[2-9][0-9](\s?[0-9]){6}$'),
  email          text check (char_length(email) <= 200),
  message        text check (char_length(message) <= 1000),
  accord         boolean not null check (accord),
  -- a test booking needs a session, a pre-registration does not
  check (type = 'inscription' or session is not null)
);

create index if not exists demandes_created_at_idx on public.demandes (created_at desc);

-- ---------- school staff ----------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- row level security ----------
alter table public.demandes enable row level security;
alter table public.admins   enable row level security;

-- Column privileges: visitors cannot choose id/created_at/statut,
-- staff can only change statut.
revoke all on public.demandes from anon, authenticated;
grant insert (type, session, enfant, naissance, niveau, ecole_actuelle, parent, tel, email, message, accord)
  on public.demandes to anon, authenticated;
grant select on public.demandes to authenticated;
grant update (statut) on public.demandes to authenticated;

revoke all on public.admins from anon, authenticated;

drop policy if exists "site: envoyer une demande" on public.demandes;
create policy "site: envoyer une demande" on public.demandes
  for insert to anon, authenticated
  with check (statut = 'nouvelle');

drop policy if exists "ecole: lire les demandes" on public.demandes;
create policy "ecole: lire les demandes" on public.demandes
  for select to authenticated
  using (public.is_admin());

drop policy if exists "ecole: suivre les demandes" on public.demandes;
create policy "ecole: suivre les demandes" on public.demandes
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- live updates in the Espace école ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'demandes'
  ) then
    alter publication supabase_realtime add table public.demandes;
  end if;
end $$;

-- ---------- give the school access ----------
-- 1. Authentication > Users > Add user (e-mail + password, "Auto confirm").
-- 2. Then run, with that e-mail:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'zahratalmadaeen3@gmail.com';
