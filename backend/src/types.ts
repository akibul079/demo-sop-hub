
export enum SOPStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum PDFGenerationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DEACTIVATED = 'DEACTIVATED',
  SUSPENDED = 'SUSPENDED'
}

export enum ApprovalAction {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  EDIT_REQUESTED = 'EDIT_REQUESTED',
  EDIT_APPROVED = 'EDIT_APPROVED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ChecklistStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  RESOLVED = 'RESOLVED'
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  size?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  jobTitle?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  managerId?: string | null;
  joinedAt?: string;
  lastActiveAt?: string;
  loginCount?: number;
  workspaceId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children?: Folder[];
  isOpen?: boolean;
  color: string;
  description?: string;
  sopCount?: number;
}

export interface SOPStep {
  id: string;
  title: string;
  description: any;
  order: number;
}

export interface ChecklistStep extends SOPStep {
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: User;
}

export interface Checklist {
  id: string;
  name: string;
  sopId: string;
  sopTitle: string;
  sopVersion: number;
  notes?: string;
  dueDate?: string;
  status: ChecklistStatus;
  progress: number;
  steps: ChecklistStep[];
  createdAt: string;
  createdBy: User;
  resolvedAt?: string;
  resolvedBy?: User;
  finalNotes?: string;
}

export interface ApprovalHistory {
  id: string;
  action: ApprovalAction;
  actionBy: User;
  actionAt: string;
  note?: string;
  previousStatus?: SOPStatus;
  newStatus: SOPStatus;
}

export interface ApprovalRequest {
  id: string;
  sopId: string;
  submittedBy: User;
  submittedAt: string;
  message?: string;
  status: ApprovalStatus;
  reviewedBy?: User;
  reviewedAt?: string;
  rejectionReason?: string;
  type?: 'PUBLISH' | 'EDIT';
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface SOP {
  id: string;
  title: string;
  shortDescription: string;
  steps: SOPStep[];
  folderIds: string[];
  assignedUserIds: string[];
  tags: Tag[];
  status: SOPStatus;
  estimatedTime?: number;
  difficulty: Difficulty;
  version: number;
  rejectionReason?: string;
  activeApprovalRequestId?: string;
  comments: Comment[];
  updatedAt: string;
  createdAt: string;
  createdBy: User;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  stepCount: number;
  coverImageUrl?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
  deleteReason?: string | null;
  permanentDeleteAt?: string | null;
  pdfStatus?: PDFGenerationStatus;
  pdfUrl?: string | null;
}

export interface SOPVersion {
  id: string;
  sopId: string;
  versionNumber: number;
  note: string;
  content: any;
  createdAt: string;
  createdBy: User;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: Difficulty;
  estimatedTime: number;
  steps: { title: string; type: string }[];
  description: string;
  content?: any;
}

export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  token: string;
  workspaceId: string;
  invitedBy: string; // User ID
  invitedAt: string;
  expiresAt: string;
  personalMessage?: string;
  assignedManagerId?: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  user: User; // For easy display
  action: string;
  entityType?: 'SOP' | 'FOLDER' | 'USER' | 'WORKSPACE' | 'CHECKLIST';
  entityId?: string;
  details?: any;
  createdAt: string;
}
