create table if not exists public.tutorials (
  id               bigserial primary key,
  slug             text unique not null,
  title            text not null,
  meta_description text,
  category         text not null check (category in ('AI对话','AI绘图','AI编程','AI效率')),
  tool_slug        text references public.tools(slug) on delete set null,
  difficulty       text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  duration_minutes integer not null default 10,
  cover_image_url  text,
  summary          text,
  content_md       text,
  steps            jsonb default '[]'::jsonb,
  tags             text[] default '{}',
  is_featured      boolean not null default false,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- RLS
alter table public.tutorials enable row level security;
create policy "public read tutorials" on public.tutorials
  for select using (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger tutorials_updated_at
  before update on public.tutorials
  for each row execute procedure public.set_updated_at();
