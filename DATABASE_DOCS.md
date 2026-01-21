# SOP Hub Database Documentation

This document provides a comprehensive overview of the database schema for the SOP Hub application. The schema is designed for a multi-tenant architecture using Supabase (PostgreSQL), with a focus on SOP management, user roles, and collaborative workflows.

## Table of Contents
- [Extensions](#extensions)
- [Enums](#enums)
- [Tables](#tables)
    - [Core Entities](#core-entities)
    - [SOP Management](#sop-management)
    - [Organization & Taxonomy](#organization--taxonomy)
    - [Workflows & Approvals](#workflows--approvals)
    - [Execution & Interaction](#execution--interaction)

---

## Extensions

- **uuid-ossp**: Enabled to generate UUIDs (v4) for primary keys.

## Enums

Custom PostgreSQL types to enforce data integrity for status and classification fields.

| Enum Name | Values | Description |
| :--- | :--- | :--- |
| `user_role` | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER` | Defines user permissions levels. |
| `user_status` | `ACTIVE`, `PENDING`, `DEACTIVATED`, `SUSPENDED` | Tracks the account state of a user. |
| `sop_status` | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PUBLISHED`, `REJECTED`, `ARCHIVED`, `DELETED` | lifecycle stages of a Standard Operating Procedure. |
| `difficulty_level` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` | Complexity rating for SOPs and Templates. |
| `checklist_status` | `ACTIVE`, `COMPLETED`, `RESOLVED` | State of an active checklist instance. |
| `approval_status` | `PENDING`, `APPROVED`, `REJECTED` | Status of a specific approval request. |
| `approval_action` | `SUBMITTED`, `APPROVED`, `REJECTED`, `PUBLISHED`, `REVISION_REQUESTED`, `EDIT_REQUESTED`, `EDIT_APPROVED` | Specific actions taken in the approval history log. |
| `pdf_generation_status` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` | Tracks the state of background PDF generation jobs. |

---

## Tables

### Core Entities

#### `workspaces`
The top-level container for all data (Multi-tenancy root).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default `uuid` | Unique identifier. |
| `name` | TEXT | ISO NOT NULL | Name of the workspace/company. |
| `slug` | TEXT | UNIQUE | URL-friendly identifier. |
| `logo_url` | TEXT | | Optional branding. |
| `size` | TEXT | | Company size indicator. |
| `created_at` | TIMESTAMPTZ | Default `NOW()` | Creation timestamp. |
| `updated_at` | TIMESTAMPTZ | Default `NOW()` | Last update timestamp. |

#### `users`
Registered users within the system.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Matches `auth.users.id` from Supabase Auth. |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address. |
| `first_name` | TEXT | NOT NULL | |
| `last_name` | TEXT | NOT NULL | |
| `role` | `user_role` | Default `MEMBER` | RBAC role. |
| `workspace_id` | UUID | FK -> `workspaces(id)` | The workspace this user belongs to. |
| `manager_id` | UUID | FK -> `users(id)` | Direct report manager. |
| `status` | `user_status` | Default `PENDING` | Account status. |

---

### SOP Management

#### `sops`
The central table for storing Standard Operating Procedures.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `title` | TEXT | NOT NULL | Title of the SOP. |
| `content` | JSONB | Default `{}` | Structured content of the SOP (e.g., blocks, steps). |
| `status` | `sop_status` | Default `DRAFT` | Current publication state. |
| `version` | INTEGER | Default `1` | Current version number. |
| `workspace_id` | UUID | FK -> `workspaces(id)` | Owner workspace. |
| `created_by` | UUID | FK -> `users(id)` | Author of the SOP. |
| `pdf_url` | TEXT | | Link to generated PDF version. |

#### `sop_versions`
Historical versions of SOPs for audit trails and rollbacks.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `sop_id` | UUID | FK -> `sops(id)` | Parent SOP. |
| `version_number`| INTEGER | NOT NULL | The version number this record represents. |
| `content` | JSONB | | Snapshot of content at this version. |
| `created_by` | UUID | FK -> `users(id)` | User who created this version/edit. |

#### `templates`
Reusable structures for creating new SOPs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `name` | TEXT | NOT NULL | Template name. |
| `steps` | JSONB | Default `[]` | Pre-defined steps structure. |
| `difficulty` | `difficulty_level`| Default `BEGINNER`| |

---

### Organization & Taxonomy

#### `folders`
Hierarchical organization structure for SOPs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `name` | TEXT | NOT NULL | Folder name. |
| `parent_id` | UUID | FK -> `folders(id)` | Parent folder (recursive) for nesting. |
| `workspace_id` | UUID | FK -> `workspaces(id)` | Owner workspace. |

#### `tags`
Labels for categorization.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `name` | TEXT | NOT NULL | Tag text. |
| `color` | TEXT | Default `#808080` | Hex color code for UI. |

#### Join Tables
- **`sop_folders`**: Mapping between SOPs and Folders (Many-to-Many).
- **`sop_tags`**: Mapping between SOPs and Tags (Many-to-Many).
- **`sop_assignments`**: Assigning SOPs to specific Users (Many-to-Many).

---

### Workflows & Approvals

#### `approval_requests`
Tracks requests to publish or edit an SOP.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `sop_id` | UUID | FK -> `sops(id)` | The SOP being reviewed. |
| `submitted_by` | UUID | FK -> `users(id)` | Requester. |
| `status` | `approval_status`| Default `PENDING` | Current state of request. |
| `type` | TEXT | Default `PUBLISH` | Type of request (`PUBLISH` or `EDIT`). |

#### `approval_history`
Audit log of individual actions taken on a request.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `request_id` | UUID | FK -> `approval_requests`| Parent request. |
| `action` | `approval_action`| NOT NULL | Action taken (e.g., `APPROVED`). |
| `action_by` | UUID | FK -> `users(id)` | User who performed the action. |
| `note` | TEXT | | Optional comment or reason. |

---

### Execution & Interaction

#### `checklists`
Live instances of an SOP being executed by a user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `sop_id` | UUID | FK -> `sops(id)` | Source SOP. |
| `sop_snapshot` | JSONB | | **Critical**: Copy of SOP steps at the moment of checklist creation to preserve integrity if SOP changes. |
| `user_id` | UUID | FK -> `users(id)` | Assignee working on the checklist. |
| `status` | `checklist_status`| Default `ACTIVE` | Execution state. |
| `progress` | INTEGER | Default `0` | Percentage or step count completed. |

#### `checklist_items`
Individual steps within a checklist instance.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `checklist_id` | UUID | FK -> `checklists(id)` | Parent checklist. |
| `step_id` | TEXT | | ID matching the step in `sop_snapshot`. |
| `is_completed`| BOOLEAN | Default `false` | Completion status. |

#### `comments`
User feedback and discussion on SOPs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier. |
| `sop_id` | UUID | FK -> `sops(id)` | Target SOP. |
| `user_id` | UUID | FK -> `users(id)` | Comment author. |
| `text` | TEXT | NOT NULL | Comment body. |

---

## Performance Indexes

Standard B-tree indexes are applied to foreign keys to optimize query performance, particularly for multi-tenant filtering by `workspace_id` and user-based lookups.

```sql
CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_sops_workspace ON sops(workspace_id);
CREATE INDEX idx_folders_workspace ON folders(workspace_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_sop_assignments_user ON sop_assignments(user_id);
CREATE INDEX idx_checklists_user ON checklists(user_id);
CREATE INDEX idx_checklists_sop ON checklists(sop_id);
```
