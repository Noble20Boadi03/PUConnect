# PuConnect — Supabase Database Schema

> Run all SQL blocks below in your Supabase **SQL Editor** (in order).

---

## 1. Extensions

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";
```

---

## 2. Custom Types (Enums)

```sql
create type user_role as enum ('student', 'admin');
create type experience_level as enum ('beginner', 'intermediate', 'expert');
create type listing_type as enum ('service_offer', 'service_request', 'project_team', 'product');
create type conversation_lifecycle as enum ('open', 'hired', 'completed');
create type filter_type as enum ('dropdown', 'multi_select', 'range', 'radio');
```

---

## 3. Tables

### 3.1 `profiles`
Extends Supabase Auth (`auth.users`). One row per registered user.

```sql
create table profiles (
  -- Mirrors auth.users.id — set on registration via trigger
  id              uuid primary key references auth.users(id) on delete cascade,

  email           text not null unique,
  full_name       text not null,
  university_id   text,                        -- student ID number

  role            user_role not null default 'student',
  is_active       boolean not null default true,

  -- Profile
  bio             text,
  skill_tags      text[]   default '{}',
  experience_level experience_level default 'beginner',
  portfolio_links text[]   default '{}',
  is_available    boolean  default true,
  profile_picture_url text,

  -- Reputation & Marketplace
  reputation_score  numeric(3,2) default 0,    -- e.g. 4.75
  completed_projects integer     default 0,
  review_count      integer      default 0,
  verified_student  boolean      default false,
  department        text,
  graduation_year   smallint,

  -- Provider upgrade flag
  can_offer_services boolean default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 3.2 `listings`

```sql
create table listings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price       numeric(10,2),                   -- for service_offer
  budget      numeric(10,2),                   -- for service_request
  category    text not null,
  subcategory text,
  type        listing_type not null,
  owner_id    uuid not null references profiles(id) on delete cascade,
  is_active   boolean not null default true,

  deadline          date,
  required_skills   text[]  default '{}',
  team_size         smallint,                  -- for project_team type
  media_url         text,
  level             text,                      -- 'beginner' | 'intermediate' | 'expert'
  department        text,
  tags              text[]  default '{}',
  average_rating    numeric(3,2) default 0,
  review_count      integer      default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 3.3 `messages`

```sql
create table messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  listing_id  uuid references listings(id) on delete set null,

  -- Denormalised for quick display (avoids extra joins in inbox)
  listing_title     text,
  listing_thumbnail text,

  message     text not null,
  is_read     boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 3.4 `conversation_lifecycles`
Tracks the status of a conversation thread between two users around a listing.

```sql
create table conversation_lifecycles (
  id          uuid primary key default gen_random_uuid(),
  user_a_id   uuid not null references profiles(id) on delete cascade,
  user_b_id   uuid not null references profiles(id) on delete cascade,
  listing_id  uuid references listings(id) on delete set null,
  state       conversation_lifecycle not null default 'open',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Ensure only one lifecycle record per pair+listing
  unique (user_a_id, user_b_id, listing_id)
);
```

### 3.5 `reviews`

```sql
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id) on delete cascade,
  author_user_id  uuid not null references profiles(id) on delete cascade,
  target_user_id  uuid not null references profiles(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  comment         text not null,

  created_at  timestamptz not null default now(),

  -- One review per author per listing
  unique (listing_id, author_user_id)
);
```

### 3.6 `subcategory_filters`
Admin-managed, dynamic filters for each subcategory page.

```sql
create table subcategory_filters (
  id              uuid primary key default gen_random_uuid(),
  subcategory     text not null,
  filter_label    text not null,
  filter_type     filter_type not null default 'dropdown',
  filter_options  jsonb not null default '[]',  -- array of option strings
  display_order   smallint not null default 1,
  is_active       boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

---

## 4. Indexes

```sql
-- listings
create index idx_listings_owner       on listings(owner_id);
create index idx_listings_category    on listings(category);
create index idx_listings_subcategory on listings(subcategory);
create index idx_listings_type        on listings(type);
create index idx_listings_is_active   on listings(is_active);
create index idx_listings_tags        on listings using gin(tags);

-- messages
create index idx_messages_sender   on messages(sender_id);
create index idx_messages_receiver on messages(receiver_id);
create index idx_messages_listing  on messages(listing_id);
create index idx_messages_created  on messages(created_at desc);

-- reviews
create index idx_reviews_target  on reviews(target_user_id);
create index idx_reviews_listing on reviews(listing_id);

-- subcategory_filters
create index idx_filters_subcategory on subcategory_filters(subcategory);
create index idx_filters_is_active   on subcategory_filters(is_active);

-- conversation_lifecycles
create index idx_conv_user_a on conversation_lifecycles(user_a_id);
create index idx_conv_user_b on conversation_lifecycles(user_b_id);
```

---

## 5. Auto-update `updated_at` Trigger

```sql
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger trg_listings_updated_at
  before update on listings
  for each row execute function handle_updated_at();

create trigger trg_messages_updated_at
  before update on messages
  for each row execute function handle_updated_at();

create trigger trg_conv_updated_at
  before update on conversation_lifecycles
  for each row execute function handle_updated_at();

create trigger trg_filters_updated_at
  before update on subcategory_filters
  for each row execute function handle_updated_at();
```

---

## 6. Auto-create Profile on Sign-up Trigger

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

## 7. Row Level Security (RLS)

```sql
alter table profiles                  enable row level security;
alter table listings                  enable row level security;
alter table messages                  enable row level security;
alter table reviews                   enable row level security;
alter table conversation_lifecycles   enable row level security;
alter table subcategory_filters       enable row level security;
```

### profiles

```sql
-- Anyone can view profiles
create policy "Profiles are viewable by all"
  on profiles for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

### listings

```sql
-- Anyone can view active listings
create policy "Active listings are public"
  on listings for select using (is_active = true);

-- Owners can see all their own listings (including inactive)
create policy "Owners can see own listings"
  on listings for select using (auth.uid() = owner_id);

-- Authenticated users can create listings
create policy "Authenticated users can create listings"
  on listings for insert with check (auth.uid() = owner_id);

-- Only owners can update/delete their listings
create policy "Owners can update own listings"
  on listings for update using (auth.uid() = owner_id);

create policy "Owners can delete own listings"
  on listings for delete using (auth.uid() = owner_id);
```

### messages

```sql
-- Users can only see their own messages
create policy "Users can view own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Authenticated users can send messages
create policy "Authenticated users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- Receivers can mark messages as read
create policy "Receivers can update read status"
  on messages for update
  using (auth.uid() = receiver_id);
```

### reviews

```sql
-- Reviews are publicly viewable
create policy "Reviews are public"
  on reviews for select using (true);

-- Authenticated users can write a review
create policy "Authenticated users can write reviews"
  on reviews for insert with check (auth.uid() = author_user_id);
```

### conversation_lifecycles

```sql
create policy "Users can view their own conversations"
  on conversation_lifecycles for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can create conversation lifecycles"
  on conversation_lifecycles for insert
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can update their own conversations"
  on conversation_lifecycles for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);
```

### subcategory_filters

```sql
-- Filters are publicly readable
create policy "Filters are public"
  on subcategory_filters for select using (is_active = true);

-- Only admins can manage filters (use Supabase service role or custom admin check)
create policy "Admins can manage filters"
  on subcategory_filters for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

---

## 8. Helper Function — Recompute Listing Rating

Called after inserting/updating a review to keep `listings.average_rating` and `listings.review_count` in sync.

```sql
create or replace function recompute_listing_rating()
returns trigger as $$
begin
  update listings
  set
    average_rating = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where listing_id = new.listing_id
    ),
    review_count = (
      select count(*)
      from reviews
      where listing_id = new.listing_id
    )
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_recompute_listing_rating
  after insert or update on reviews
  for each row execute function recompute_listing_rating();
```

---

## 9. Seed Data — Subcategory Filters

> [!NOTE]  
> Run this to pre-populate the dynamic filter options for every subcategory page.

```sql
insert into subcategory_filters (subcategory, filter_label, filter_type, filter_options, display_order) values
-- Subject Tutoring
('Subject Tutoring', 'Subject', 'dropdown', '["Math","Physics","Chemistry","Biology","Computer Science","Literature","History","Economics"]', 1),

-- Study Group Facilitation
('Study Group Facilitation', 'Subject / Course', 'dropdown', '["Math","Physics","Computer Science","Business","Engineering"]', 1),
('Study Group Facilitation', 'Group size', 'dropdown', '["2-3 students","4-5 students","6+ students"]', 2),

-- Translation
('Translation', 'Language Pair', 'dropdown', '["French → English","English → French","Spanish → English","English → Spanish","Twi → English","Spanish → Twi"]', 1),
('Translation', 'Document type', 'dropdown', '["academic","casual","legal"]', 2),

-- Website & App Development
('Website & App Development', 'Service Type', 'dropdown', '["Landing page","Portfolio","E-commerce","Mobile app","Full-stack Web App"]', 1),

-- Software Engineering Support
('Software Engineering Support', 'Programming Language / Tech', 'dropdown', '["Python","Java","JavaScript","TypeScript","C++","SQL","Go"]', 1),
('Software Engineering Support', 'Task type', 'dropdown', '["debugging","code review","tutoring","architecture design"]', 2),

-- IT Support & Troubleshooting
('IT Support & Troubleshooting', 'Issue/Device Type', 'dropdown', '["Laptop","Network","Software install","Printer","Data Recovery"]', 1),
('IT Support & Troubleshooting', 'OS', 'dropdown', '["Windows","Mac","Linux"]', 2),

-- Event Photography/Video
('Event Photography/Video', 'Event Type', 'dropdown', '["Birthday","Graduation","Conference","Sports","Party/Social"]', 1),

-- Video Editing & Content
('Video Editing & Content', 'Content Type', 'dropdown', '["YouTube","Reels/TikTok","Documentary","Podcast","Music Video"]', 1),

-- Graphic Design
('Graphic Design', 'Design Type', 'dropdown', '["Logo","Flyer","Social media post","Branding","Poster","UI/UX"]', 1),

-- CV & Cover Letters
('CV & Cover Letters', 'Service Type', 'dropdown', '["CV writing","Cover letter","Review/edit","LinkedIn alignment"]', 1),

-- Career / Internship Support
('Career / Internship Support', 'Support Type', 'dropdown', '["Interview prep","Job search strategy","Application review","Mock Interviews"]', 1),

-- LinkedIn Optimization
('LinkedIn Optimization', 'Service Type', 'dropdown', '["Profile rewrite","Headline only","Full audit","Networking strategy"]', 1),

-- Equipment Rental
('Equipment Rental', 'Equipment Category', 'dropdown', '["Camera","Lighting","Audio","Projector","Sports gear"]', 1),
('Equipment Rental', 'Rental duration', 'dropdown', '["1 day","2-3 days","1 week","2+ weeks"]', 2),
('Equipment Rental', 'Availability', 'dropdown', '["Available Now","Next Week","Pre-book"]', 3),

-- Beauty & Personal Care
('Beauty & Personal Care', 'Service Type', 'dropdown', '["Hair","Makeup","Nails","Skincare","Braiding","Barbering"]', 1);
```

---

## Summary

| Table | Purpose |
|---|---|
| `profiles` | Extended user info (mirrors `auth.users`) |
| `listings` | Service offers, requests & projects |
| `messages` | Chat messages between users |
| `conversation_lifecycles` | Thread status (open → hired → completed) |
| `reviews` | Ratings & comments on listings |
| `subcategory_filters` | Dynamic filter config per subcategory |

> [!IMPORTANT]
> **Supabase Storage** — Create a bucket called `listing-media` (public) for listing images, and a bucket called `profile-pictures` (public) for user avatars. Set the bucket policies to allow authenticated uploads.
