# Supabase setup

This project includes a basic Supabase client and a starter SQL migration.

Files added:

- `lib/supabase.ts` — exports `getSupabase()` which returns a real Supabase client when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided, otherwise falls back to a mock.
- `supabase/migrations/0001_init.sql` — initial migration creating a `profiles` table.
- `.env.example` / `.env` — Vite env variables for Supabase.

## Recommended local steps

1. Install the Supabase CLI (optional, for migrations):

   npm install -g supabase

2. Populate `.env` with your project's values (or set them in your deployment environment):

   - `VITE_SUPABASE_URL` — your Supabase URL (e.g. https://abcd1234.supabase.co)
   - `VITE_SUPABASE_ANON_KEY` — your anon/public API key

3a. Run the SQL migration using Supabase CLI (if you prefer CLI):

- Link the local project to your Supabase project:
  `supabase link --project-ref <project-ref>`

- Apply the migration manually (Supabase CLI has multiple migration workflows). A simple approach is to run the SQL directly against your database using psql or the SQL editor in the Supabase web console.

3b. Or run the SQL manually (recommended for a first setup):

- Open your Supabase project → SQL Editor → run the contents of `supabase/migrations/0001_init.sql`.

## Notes

- Do NOT commit real secret keys to version control. Use environment secrets in production.
- Vite loads `.env` automatically; variables must be prefixed with `VITE_` to be exposed to the client.
