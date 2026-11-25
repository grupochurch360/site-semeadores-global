ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized ON public.users (lower(email));
REVOKE ALL ON public.users FROM anon, authenticated;
GRANT ALL ON public.users TO service_role;
