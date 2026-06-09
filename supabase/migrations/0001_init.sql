-- ============================================================================
-- CreativeFlow AI — initial schema
-- Maps the OS Framework system-of-record onto Postgres:
--   profiles      -> Users / Team Members
--   prompts       -> Settings (per-function AI system prompt)
--   prompt_versions-> prompt history
--   sessions      -> Core Records (a campaign)
--   generations   -> Generation log / audit trail (one row per function run)
--   settings      -> global config (active provider/model, thresholds)
-- ============================================================================

-- ── Helper: is the current user an admin? ───────────────────────────────────
-- SECURITY DEFINER so policies can call it without recursing through profiles RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text,
  email        text,
  role         text not null default 'user' check (role in ('admin','user')),
  credit_limit integer,                 -- NULL = unlimited
  credits_used integer not null default 0,
  status       text not null default 'active' check (status in ('active','invited','disabled')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: self or admin can read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: admin can update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ── Signup trigger: create a profile for every new auth user ────────────────
-- The very first user to sign up becomes the admin (bootstrap).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first  boolean;
  dflt_limit integer;
begin
  select count(*) = 0 into is_first from public.profiles;

  begin
    select (value::text)::integer into dflt_limit
    from public.settings where key = 'default_credit_limit';
  exception when others then
    dflt_limit := 500;
  end;
  if dflt_limit is null then dflt_limit := 500; end if;

  insert into public.profiles (id, name, email, role, credit_limit, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case when is_first then 'admin' else 'user' end,
    case when is_first then null else dflt_limit end,  -- first admin is unlimited
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── prompts (editable per-function system prompt) ───────────────────────────
create table if not exists public.prompts (
  id            uuid primary key default gen_random_uuid(),
  function_key  text unique not null,
  name          text not null,
  system_prompt text not null,
  version       integer not null default 1,
  updated_by    uuid references auth.users(id),
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table public.prompts enable row level security;

create policy "prompts: authenticated can read"
  on public.prompts for select
  using (auth.uid() is not null);

create policy "prompts: admin can write"
  on public.prompts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── prompt_versions (history) ───────────────────────────────────────────────
create table if not exists public.prompt_versions (
  id            uuid primary key default gen_random_uuid(),
  prompt_id     uuid references public.prompts(id) on delete cascade,
  function_key  text not null,
  version       integer not null,
  system_prompt text not null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

alter table public.prompt_versions enable row level security;

create policy "prompt_versions: admin can read"
  on public.prompt_versions for select
  using (public.is_admin());

create policy "prompt_versions: admin can insert"
  on public.prompt_versions for insert
  with check (public.is_admin());

-- ── sessions (a campaign / Core Record) ─────────────────────────────────────
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text,
  company          text,
  product          text,
  audience         text,
  offer            text,
  objective        text,
  context          text,
  selected_angle   text,
  selected_primary text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists sessions_user_idx on public.sessions(user_id, updated_at desc);

alter table public.sessions enable row level security;

create policy "sessions: owner or admin can read"
  on public.sessions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "sessions: owner can insert"
  on public.sessions for insert
  with check (user_id = auth.uid());

create policy "sessions: owner can update"
  on public.sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "sessions: owner can delete"
  on public.sessions for delete
  using (user_id = auth.uid());

-- ── generations (generation log / audit trail) ─────────────────────────────
create table if not exists public.generations (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.sessions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  function_key  text not null,
  input         jsonb,
  output        jsonb,
  provider      text,
  model         text,
  input_tokens  integer not null default 0,
  output_tokens integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists generations_user_idx on public.generations(user_id, created_at desc);
create index if not exists generations_session_idx on public.generations(session_id, created_at desc);

alter table public.generations enable row level security;

create policy "generations: owner or admin can read"
  on public.generations for select
  using (user_id = auth.uid() or public.is_admin());

create policy "generations: owner can insert"
  on public.generations for insert
  with check (user_id = auth.uid());

-- ── settings (global config) ────────────────────────────────────────────────
create table if not exists public.settings (
  key        text primary key,
  value      jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings: authenticated can read"
  on public.settings for select
  using (auth.uid() is not null);

create policy "settings: admin can write"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Seed the 3 default prompts (verbatim from the design mockup) ────────────
-- Idempotent: on conflict do nothing, so re-running migrations is safe.
insert into public.prompts (function_key, name, system_prompt, version) values
(
  'fn1', 'Creative angle generator',
  $prompt$You are an expert direct-response marketing strategist. Analyze the campaign brief and generate 10 distinct creative marketing angles.

Return ONLY valid JSON — no preamble, no markdown:
{
  "angles": [{"name": "string", "description": "string"}],
  "pain_points": ["string","string","string"],
  "desires": ["string","string","string"],
  "objections": ["string","string","string"]
}

Rules: angles must have exactly 10 items. pain_points, desires, objections each have exactly 3 items. All descriptions must reference the specific product and audience — no generic advice.$prompt$,
  1
),
(
  'fn2', 'Ads copy generator',
  $prompt$You are an expert direct-response copywriter specializing in paid social advertising. Write high-converting ad copy for the specified platform and tone.

Return ONLY valid JSON — no preamble, no markdown:
{
  "primary_texts": ["string","string","string","string","string"],
  "headlines": ["string","string","string","string","string","string","string","string","string","string"],
  "ctas": ["string","string","string","string","string"]
}

Rules: primary_texts exactly 5 items (2-4 sentences each). headlines exactly 10 items (max 8 words). ctas exactly 5 items (max 5 words). All copy must reflect the selected angle and tone.$prompt$,
  1
),
(
  'fn3', 'Creative brief generator',
  $prompt$You are a senior creative director. Write a complete production-ready creative brief that a video editor or graphic designer can execute without further briefing.

Return ONLY valid JSON — no preamble, no markdown:
{
  "hook": "string",
  "visual_concept": "string",
  "scene_breakdown": [{"timestamp":"string","description":"string"},{"timestamp":"string","description":"string"},{"timestamp":"string","description":"string"},{"timestamp":"string","description":"string"}],
  "ai_image_prompt": "string",
  "designer_notes": "string"
}

Rules: hook is 1 sentence. scene_breakdown has exactly 4 items. ai_image_prompt uses the syntax of the specified AI image tool. designer_notes is 3-5 bullet points as a single string with newlines.$prompt$,
  1
)
on conflict (function_key) do nothing;

insert into public.settings (key, value) values
  ('default_credit_limit', '500'::jsonb)
on conflict (key) do nothing;
