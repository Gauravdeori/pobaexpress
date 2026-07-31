-- Poba Express — initial schema.
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- Design notes
--   * Accounts are optional. Guests order without signing in, so both tables
--     accept rows with a null user_id.
--   * Prescriptions are medical data, so the bucket is write-only to the
--     public: anyone may upload, nobody may read back except the signed-in
--     owner. The business reads them from the dashboard or with the service
--     key. This is why guest orders carry a storage path rather than a link.

-- ---------------------------------------------------------------- profiles --

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile readable" on public.profiles;
create policy "own profile readable"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "own profile writable" on public.profiles;
create policy "own profile writable"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "own profile updatable" on public.profiles;
create policy "own profile updatable"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------------ orders --

create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete set null,
  category           text not null check (category in ('food', 'cake', 'medicine')),
  customer_name      text not null,
  phone              text not null,
  address            text not null,
  lines              jsonb not null default '[]'::jsonb,
  subtotal           integer not null default 0,
  delivery_fee       integer not null default 0,
  total              integer not null default 0,
  extra_request      text,
  notes              text,
  prescription_path  text,
  status             text not null default 'new'
                     check (status in ('new', 'confirmed', 'delivered', 'cancelled')),
  created_at         timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

-- Guests must be able to place an order, so anon may insert. They may not read
-- anything back: without this split, one anon key would expose every order.
drop policy if exists "anyone may place an order" on public.orders;
create policy "anyone may place an order"
  on public.orders for insert
  to anon, authenticated
  with check (
    -- A row may only be attributed to the user placing it.
    user_id is null or user_id = auth.uid()
  );

drop policy if exists "own orders readable" on public.orders;
create policy "own orders readable"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------------------- storage --

insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do nothing;

-- Uploads are open; reads are not.
drop policy if exists "anyone may upload a prescription" on storage.objects;
create policy "anyone may upload a prescription"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'prescriptions');

-- Only the signed-in owner can read their own uploads, which is what lets the
-- app hand them a signed link. Guest uploads are deliberately unreadable with
-- the publishable key — retrieve those from the dashboard or with the service
-- key, so a leaked publishable key can never enumerate prescriptions.
drop policy if exists "own prescriptions readable" on storage.objects;
create policy "own prescriptions readable"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'prescriptions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- --------------------------------------------------------- profile on join --

-- Give every new user an empty profile row so the order form has something to
-- read without a separate create step.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
