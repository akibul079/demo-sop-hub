-- Drop the broken SELECT policy
DROP POLICY IF EXISTS "Users can view users in their workspace" ON public.users;

-- Create new SELECT policy (allows self-view even with NULL workspace)
CREATE POLICY "Users can view their own profile and workspace users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()  -- Can always see their own profile
    OR 
    (workspace_id IS NOT NULL AND workspace_id IN (
      SELECT workspace_id FROM public.users 
      WHERE id = auth.uid()
    ))
  );
