-- Private Rooms by TRG — core schema + RLS (idempotent where possible)
-- Run via: supabase db push / SQL Editor / supabase migration up

create extension if not exists "pgcrypto";

-- ─── profiles (1:1 with auth.users) ─────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  avatar_url text,
  avatar_initials text,
  phone text,
  role text not null default 'guest' check (role in ('guest', 'host')),
  verified boolean not null default false,
  superhost boolean not null default false,
  joined_year integer,
  response_rate integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── properties ─────────────────────────────────────────────────────────────
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  location text not null,
  description text not null default '',
  price_per_night numeric not null check (price_per_night >= 0),
  property_type text not null default 'Apartment',
  min_stay integer not null default 1 check (min_stay >= 1),
  max_guests integer not null default 2 check (max_guests >= 1),
  bedrooms integer not null default 1,
  bathrooms numeric not null default 1,
  amenities text[] default '{}',
  instant_book boolean not null default false,
  verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'live')),
  rating numeric,
  review_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_host on public.properties (host_id);
create index if not exists idx_properties_status on public.properties (status);

-- ─── property_images ──────────────────────────────────────────────────────
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_property_images_property on public.property_images (property_id);

-- ─── bookings ───────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  nights integer not null,
  price_per_night numeric not null,
  subtotal numeric not null,
  service_fee numeric not null default 0,
  total numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_guest on public.bookings (guest_id);
create index if not exists idx_bookings_host on public.bookings (host_id);
create index if not exists idx_bookings_property on public.bookings (property_id);

-- ─── conversations + messages ───────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_guest on public.conversations (guest_id);
create index if not exists idx_conversations_host on public.conversations (host_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages (conversation_id);

-- ─── reviews (requires completed/confirmed booking) ─────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_one_per_booking unique (booking_id)
);

create index if not exists idx_reviews_property on public.reviews (property_id);

-- ─── notifications ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  description text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id);

-- ─── blocked_dates ────────────────────────────────────────────────────────────
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  blocked_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (property_id, blocked_date)
);

create index if not exists idx_blocked_dates_property on public.blocked_dates (property_id);

-- ─── Auto-update updated_at ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_properties_updated on public.properties;
create trigger trg_properties_updated
  before update on public.properties
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_conversations_updated on public.conversations;
create trigger trg_conversations_updated
  before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.blocked_dates enable row level security;

-- Drop existing policies if re-run (names are stable)
do $$ begin
  -- profiles
  drop policy if exists "profiles_select_public" on public.profiles;
  drop policy if exists "profiles_insert_own" on public.profiles;
  drop policy if exists "profiles_update_own" on public.profiles;
  -- properties
  drop policy if exists "properties_select_visible" on public.properties;
  drop policy if exists "properties_insert_host" on public.properties;
  drop policy if exists "properties_update_own" on public.properties;
  -- property_images
  drop policy if exists "property_images_select" on public.property_images;
  drop policy if exists "property_images_insert" on public.property_images;
  -- bookings
  drop policy if exists "bookings_select_parties" on public.bookings;
  drop policy if exists "bookings_insert_guest" on public.bookings;
  drop policy if exists "bookings_update_parties" on public.bookings;
  -- conversations
  drop policy if exists "conversations_select_parties" on public.conversations;
  drop policy if exists "conversations_insert" on public.conversations;
  drop policy if exists "conversations_update_parties" on public.conversations;
  -- messages
  drop policy if exists "messages_select_thread" on public.messages;
  drop policy if exists "messages_insert" on public.messages;
  -- reviews
  drop policy if exists "reviews_select" on public.reviews;
  drop policy if exists "reviews_insert_reviewer" on public.reviews;
  -- notifications
  drop policy if exists "notifications_own" on public.notifications;
  drop policy if exists "notifications_select_own" on public.notifications;
  drop policy if exists "notifications_update_own" on public.notifications;
  drop policy if exists "notifications_insert_cross" on public.notifications;
  drop policy if exists "notifications_delete_own" on public.notifications;
  -- blocked_dates
  drop policy if exists "blocked_dates_select" on public.blocked_dates;
  drop policy if exists "blocked_dates_mutate_host" on public.blocked_dates;
exception when others then null;
end $$;

-- Profiles: readable for listing host info; users manage own row
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Properties: live listings public; hosts see own (any status)
create policy "properties_select_visible"
  on public.properties for select
  using (
    status = 'live'
    or host_id = auth.uid()
  );

create policy "properties_insert_host"
  on public.properties for insert
  with check (auth.uid() = host_id);

create policy "properties_update_own"
  on public.properties for update
  using (auth.uid() = host_id);

-- Images: visible if parent property is visible to viewer
create policy "property_images_select"
  on public.property_images for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.status = 'live' or p.host_id = auth.uid())
    )
  );

create policy "property_images_insert"
  on public.property_images for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.host_id = auth.uid()
    )
  );

-- Bookings
create policy "bookings_select_parties"
  on public.bookings for select
  using (guest_id = auth.uid() or host_id = auth.uid());

create policy "bookings_insert_guest"
  on public.bookings for insert
  with check (guest_id = auth.uid());

create policy "bookings_update_parties"
  on public.bookings for update
  using (guest_id = auth.uid() or host_id = auth.uid());

-- Conversations
create policy "conversations_select_parties"
  on public.conversations for select
  using (guest_id = auth.uid() or host_id = auth.uid());

create policy "conversations_insert"
  on public.conversations for insert
  with check (guest_id = auth.uid() or host_id = auth.uid());

create policy "conversations_update_parties"
  on public.conversations for update
  using (guest_id = auth.uid() or host_id = auth.uid());

-- Messages: participants in parent conversation
create policy "messages_select_thread"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.guest_id = auth.uid() or c.host_id = auth.uid())
    )
  );

create policy "messages_insert"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.guest_id = auth.uid() or c.host_id = auth.uid())
    )
  );

-- Reviews: readable for live properties; insert by reviewer
create policy "reviews_select"
  on public.reviews for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.status = 'live' or p.host_id = auth.uid())
    )
  );

create policy "reviews_insert_reviewer"
  on public.reviews for insert
  with check (reviewer_id = auth.uid());

-- Notifications: read/update/delete own; insert for self or conversation/booking counterparty
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_insert_cross"
  on public.notifications for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversations c
      where (c.host_id = user_id and c.guest_id = auth.uid())
         or (c.guest_id = user_id and c.host_id = auth.uid())
    )
    or exists (
      select 1 from public.bookings b
      where (b.host_id = user_id and b.guest_id = auth.uid())
         or (b.guest_id = user_id and b.host_id = auth.uid())
    )
  );

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications for delete
  using (user_id = auth.uid());

-- Blocked dates
create policy "blocked_dates_select"
  on public.blocked_dates for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.status = 'live' or p.host_id = auth.uid())
    )
  );

create policy "blocked_dates_mutate_host"
  on public.blocked_dates for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.host_id = auth.uid()
    )
  );
