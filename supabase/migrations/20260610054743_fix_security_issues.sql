-- 1. Remove overly-broad public listing policy on media bucket.
--    Public buckets serve files by URL without needing an RLS SELECT policy.
--    The authenticated-only "users_read_own_media" policy already covers authed reads.
DROP POLICY IF EXISTS "public_read_media" ON storage.objects;

-- 2. Ensure handle_new_user() cannot be called directly via the REST API.
--    It is a trigger-only function; anon/authenticated must never execute it directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
