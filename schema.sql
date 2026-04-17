-- ============================================================
-- AI Tools Navigator — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Categories ───────────────────────────────────────────────
create table if not exists categories (
  id           text primary key,          -- e.g. "chat"
  slug         text unique not null,
  name         text not null,
  description  text,
  icon         text,                      -- emoji
  sort_order   int default 0,
  tool_count   int default 0,
  created_at   timestamptz default now()
);

-- ── Tools ────────────────────────────────────────────────────
create table if not exists tools (
  id               text primary key default gen_random_uuid()::text,
  slug             text unique not null,
  name             text not null,
  tagline          text,
  description      text,
  category         text references categories(id) on delete set null,
  tags             text[]        default '{}',
  website          text,
  logo_url         text,
  image_url        text,
  screenshot_url   text,
  pricing          text          default 'free',   -- free | freemium | paid | enterprise
  pricing_detail   text,
  rating           numeric(3,1)  default 0,
  review_count     int           default 0,
  title            text,
  meta_description text,
  hero_title       text,
  hero_subtitle    text,
  introduction     text,
  features         text[]        default '{}',
  pros             text[]        default '{}',
  cons             text[]        default '{}',
  use_cases        text[]        default '{}',
  faqs             jsonb         default '[]',     -- [{question, answer}]
  how_to_steps     jsonb         default '[]',     -- [{name, text, imageUrl?}]
  target_users     jsonb         default '[]',     -- [{type, description}]
  pricing_tiers    jsonb         default '[]',     -- [{name, price, features[]}]
  similar_tools    jsonb         default '[]',     -- [{name, slug}]
  is_featured      boolean       default false,
  is_new           boolean       default false,
  created_at       timestamptz   default now(),
  updated_at       timestamptz   default now()
);

-- ── Comparisons ──────────────────────────────────────────────
create table if not exists comparisons (
  id               text primary key default gen_random_uuid()::text,
  slug             text unique not null,
  tool_a_slug      text not null,
  tool_b_slug      text not null,
  title            text not null,
  meta_description text,
  summary          text,
  content_md       text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists tools_category_idx    on tools(category);
create index if not exists tools_is_featured_idx on tools(is_featured);
create index if not exists tools_is_new_idx      on tools(is_new);
create index if not exists tools_pricing_idx     on tools(pricing);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tools_updated_at on tools;
create trigger tools_updated_at
  before update on tools
  for each row execute function set_updated_at();

drop trigger if exists comparisons_updated_at on comparisons;
create trigger comparisons_updated_at
  before update on comparisons
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
alter table categories  enable row level security;
alter table tools       enable row level security;
alter table comparisons enable row level security;

-- Public read access (drop first to avoid duplicate errors)
drop policy if exists "public read categories"  on categories;
drop policy if exists "public read tools"       on tools;
drop policy if exists "public read comparisons" on comparisons;

create policy "public read categories"  on categories  for select using (true);
create policy "public read tools"       on tools       for select using (true);
create policy "public read comparisons" on comparisons for select using (true);

-- Service role has full access (used by seed script)
-- No additional policy needed — service role bypasses RLS by default
