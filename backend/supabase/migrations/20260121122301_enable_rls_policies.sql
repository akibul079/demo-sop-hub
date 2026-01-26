-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for workspaces (allow authenticated users to read their workspace)
CREATE POLICY "Users can view their own workspace"
  ON workspaces FOR SELECT
                               TO authenticated
                               USING (id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Create policies for users (users can view users in their workspace)
CREATE POLICY "Users can view users in their workspace"
  ON users FOR SELECT
                          TO authenticated
                          USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
                          TO authenticated
                          USING (id = auth.uid());

-- Create policies for folders (workspace-based access)
CREATE POLICY "Users can view folders in their workspace"
  ON folders FOR SELECT
                            TO authenticated
                            USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create folders in their workspace"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update folders in their workspace"
  ON folders FOR UPDATE
                                   TO authenticated
                                   USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete folders in their workspace"
  ON folders FOR DELETE
TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Create policies for SOPs (workspace-based access)
CREATE POLICY "Users can view SOPs in their workspace"
  ON sops FOR SELECT
                         TO authenticated
                         USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create SOPs in their workspace"
  ON sops FOR INSERT
  TO authenticated
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update SOPs in their workspace"
  ON sops FOR UPDATE
                                TO authenticated
                                USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete SOPs in their workspace"
  ON sops FOR DELETE
TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Create policies for other tables (similar pattern)
CREATE POLICY "Users can manage SOP folders in their workspace"
  ON sop_folders FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can manage SOP assignments in their workspace"
  ON sop_assignments FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can manage tags in their workspace"
  ON tags FOR ALL
  TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage SOP tags in their workspace"
  ON sop_tags FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can manage approval requests in their workspace"
  ON approval_requests FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can view approval history in their workspace"
  ON approval_history FOR SELECT
                                                                        TO authenticated
                                                                        USING (request_id IN (SELECT id FROM approval_requests WHERE sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))));

CREATE POLICY "Users can manage checklists in their workspace"
  ON checklists FOR ALL
  TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage checklist items"
  ON checklist_items FOR ALL
  TO authenticated
  USING (checklist_id IN (SELECT id FROM checklists WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can manage comments in their workspace"
  ON comments FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));

-- Allow all operations on templates (public templates)
CREATE POLICY "Templates are viewable by all authenticated users"
  ON templates FOR SELECT
                                                   TO authenticated
                                                   USING (true);

-- Allow all operations on sop_versions for workspace members
CREATE POLICY "Users can manage SOP versions in their workspace"
  ON sop_versions FOR ALL
  TO authenticated
  USING (sop_id IN (SELECT id FROM sops WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())));
