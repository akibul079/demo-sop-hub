-- Allow users to insert their own record during signup
-- This is triggered by Supabase Auth when a user signs up
CREATE POLICY "Allow user signup"
  ON users FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Also update the existing SELECT policy to allow users to view themselves
DROP POLICY IF EXISTS "Users can view users in their workspace" ON users;

CREATE POLICY "Users can view users in their workspace"
  ON users FOR SELECT
                                      TO authenticated
                                      USING (
                                      workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
                                      OR id = auth.uid()  -- Allow users to view their own profile even without workspace
                                      );
