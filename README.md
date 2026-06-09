# CreativeFlow AI

A modular **client + admin portal** for AI marketing generation, built from the
`creativeflow_ai_v2.html` design and structured around the Airtable×n8n MCP OS
framework (system-of-record tables, editable prompts, generation/audit log).

- **Client portal** — 3 chained AI functions (each is one prompt → structured JSON):
  **Creative angles → Ads copy → Creative brief**, with session carry-forward,
  a Dashboard, and History.
- **Admin portal** — manage **users** (invite / edit / disable, roles, credits),
  edit **prompts** per function (with versioning), and a **generation log**.

**Stack:** Next.js 16 (App Router, TypeScript) · Supabase (Postgres + Auth) ·
provider-agnostic AI layer (Gemini / OpenAI / Claude / demo) · deploys to Vercel.

---

## How it's modular (where to change things)

| To change… | Edit… |
|---|---|
| A function's **prompt** | Admin portal → Prompts (persists + versions; no deploy) |
| The **AI provider / model** | `.env` → `AI_PROVIDER` (`gemini`\|`openai`\|`claude`\|`demo`) + `AI_MODEL` |
| **Add a new function** | add `lib/functions/fnX.ts` (schema + prompt builder + carry-forward) → list it in `lib/functions/registry.ts` → add a screen in `components/screens/` mapped in `app/(client)/fn/[key]/page.tsx` |
| The **design** | `app/globals.css` (ported verbatim from the mockup) |
| **Data model** | `supabase/migrations/0001_init.sql` |

The AI layer (`lib/ai/`) exposes a single `generate()` — every provider implements
one interface, and it falls back to canned **demo** output when no key is set.

---

## Prerequisites

- Node.js LTS, and the CLIs: `supabase`, `vercel`, `gh` (all authenticated).
- A **Supabase** project (free tier). Settings → API gives you the URL + keys.
- *(Optional, for free real AI)* a Google AI Studio key: https://aistudio.google.com/app/apikey

## 1. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Settings → API.
- `AI_PROVIDER` — start with `demo` (no key) or `gemini` (free real AI).
- `GEMINI_API_KEY` — only if `AI_PROVIDER=gemini`.

## 2. Provision the database

Link your Supabase project and push the schema (creates all tables, RLS,
the signup trigger, and seeds the 3 default prompts):

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

> First-run bootstrap: **the first account that signs up becomes the admin**
> (unlimited credits). Everyone after is a normal user.

In Supabase → **Authentication → Providers → Email**, optionally disable
"Confirm email" during development so signup logs you in instantly.

## 3. Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

- Sign up → you're the admin → you land in the client portal.
- Run **Creative angles → Ads copy → Creative brief**; with no key it returns
  demo output, with `GEMINI_API_KEY` set it's real AI. Credits decrement; runs
  appear in **History** and the admin **Generation log**.
- Switch to the **Admin portal** (top-right tab) to manage users + prompts.

## 4. Deploy to Vercel

```bash
# source control
gh repo create creativeflow-ai --private --source=. --remote=origin --push

# deploy
vercel            # link/create the project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add AI_PROVIDER
vercel env add GEMINI_API_KEY        # if using Gemini
vercel --prod
```

Add your deployed URL to Supabase → Authentication → URL Configuration
(Site URL + redirect URLs).

---

## Project structure

```
app/
  (auth)/login, signup            # email + password
  (client)/                       # client portal (dashboard, fn/[key], history)
  (admin)/admin/                  # admin portal (users, prompts, log)
  api/{generate,sessions,prompts,users}
components/                       # chrome, screens, shared UI
lib/
  ai/                             # provider-agnostic generate() + providers + demo
  functions/                      # the 3 functions + registry (modular core)
  supabase/{client,server,admin}  # browser / RLS-server / service-role clients
  auth.ts                         # getAuth / requireUser / requireAdmin
proxy.ts                          # Next 16 proxy (auth session + route guards)
supabase/migrations/0001_init.sql # schema + RLS + trigger + prompt seed
```

## Notes

- Invited users get a one-time temp password shown to the admin (works without
  SMTP). Wire Supabase invite emails later for a polished flow.
- `proxy.ts` is the Next 16 name for what used to be `middleware.ts`.
- 1 credit per generation; admins are unlimited by default.
