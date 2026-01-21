-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'DEACTIVATED', 'SUSPENDED');
CREATE TYPE sop_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'DELETED');
CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE checklist_status AS ENUM ('ACTIVE', 'COMPLETED', 'RESOLVED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE approval_action AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'REVISION_REQUESTED', 'EDIT_REQUESTED', 'EDIT_APPROVED');
CREATE TYPE pdf_generation_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Tables

-- Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
-- Note: In a real Supabase setup, this would check auth.uid(), but for this schema we define the structure.
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Matches auth.users.id
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'MEMBER',
    status user_status DEFAULT 'PENDING',
    
    workspace_id UUID REFERENCES workspaces(id),
    
    job_title TEXT,
    department TEXT,
    phone TEXT,
    timezone TEXT,
    locale TEXT,
    
    manager_id UUID REFERENCES users(id),
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#808080',
    
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    is_open BOOLEAN DEFAULT false, -- UI Helper
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOPs
CREATE TABLE sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    short_description TEXT,
    
    content JSONB DEFAULT '{}'::jsonb,
    step_count INTEGER DEFAULT 0,
    
    status sop_status DEFAULT 'DRAFT',
    difficulty difficulty_level DEFAULT 'BEGINNER',
    version INTEGER DEFAULT 1,
    estimated_time INTEGER, -- In minutes
    
    cover_image_url TEXT,
    
    created_by UUID REFERENCES users(id),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    rejection_reason TEXT,
    active_approval_request_id UUID, -- Circular reference deferred or managed by ID
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Deletion
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by_id UUID REFERENCES users(id),
    delete_reason TEXT,
    permanent_delete_at TIMESTAMP WITH TIME ZONE,

    -- PDF
    pdf_status pdf_generation_status,
    pdf_url TEXT
);

-- SOP Versions (History)
CREATE TABLE sop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    note TEXT,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    difficulty difficulty_level DEFAULT 'BEGINNER',
    estimated_time INTEGER,
    
    steps JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    content JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-Many: SOPs <-> Folders
CREATE TABLE sop_folders (
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    PRIMARY KEY (sop_id, folder_id)
);

-- Many-to-Many: SOPs <-> Assigned Users
CREATE TABLE sop_assignments (
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (sop_id, user_id)
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#808080',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE sop_tags (
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (sop_id, tag_id)
);

-- Approval Requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    
    status approval_status DEFAULT 'PENDING',
    
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    type TEXT DEFAULT 'PUBLISH' -- 'PUBLISH' | 'EDIT'
);

-- Approval History
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
    action approval_action NOT NULL,
    
    action_by UUID REFERENCES users(id),
    action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    note TEXT,
    previous_status sop_status,
    new_status sop_status
);

-- Checklists (Instances of SOPs assigned to users)
CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    
    sop_id UUID REFERENCES sops(id) ON DELETE SET NULL,
    sop_version INTEGER,
    sop_snapshot JSONB, -- Initial snapshot of steps
    
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Assignee/Creator (depending on logic)
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    status checklist_status DEFAULT 'ACTIVE',
    progress INTEGER DEFAULT 0,
    
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    final_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    
    step_id TEXT, -- ID from JSON content/snapshot
    
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id)
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_sops_workspace ON sops(workspace_id);
CREATE INDEX idx_folders_workspace ON folders(workspace_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_sop_assignments_user ON sop_assignments(user_id);
CREATE INDEX idx_checklists_user ON checklists(user_id);
CREATE INDEX idx_checklists_sop ON checklists(sop_id);

-- Optional: Add deferred constraint if needed (requires altering table after creation)
-- ALTER TABLE sops ADD CONSTRAINT fk_sops_approval_request FOREIGN KEY (active_approval_request_id) REFERENCES approval_requests(id) DEFERRABLE INITIALLY DEFERRED;
