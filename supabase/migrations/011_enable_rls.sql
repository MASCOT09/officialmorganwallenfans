-- Enable Row Level Security on all public tables.
-- The Next.js app accesses Supabase only via the service role (server-side), which bypasses RLS.
-- With RLS on and no permissive policies, anon/authenticated roles cannot read or write data.

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
  END LOOP;
END $$;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
