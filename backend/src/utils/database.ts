// src/utils/database.ts
import { supabase } from '../config/supabase';
import { User, UserRole, UserStatus, SOP, Folder, Checklist, ApprovalRequest } from '../types';

/**
 * Database helper functions for clean, reusable queries
 */

// ==================== USERS ====================

export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);
  
  if (error) throw error;
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId);
  
  if (error) throw error;
};

// ==================== FOLDERS ====================

export const fetchAllFolders = async (workspaceId?: string) => {
  let query = supabase
    .from('folders')
    .select('*')
    .order('name', { ascending: true });
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createFolder = async (folderData: {
  name: string;
  description?: string;
  parent_id?: string | null;
  color?: string;
  workspace_id: string;
}) => {
  const { data, error } = await supabase
    .from('folders')
    .insert({
      name: folderData.name,
      description: folderData.description,
      parent_id: folderData.parent_id || null,
      color: folderData.color || '#808080',
      workspace_id: folderData.workspace_id,
      is_open: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ==================== SOPS ====================

export const fetchAllSOPs = async (workspaceId?: string) => {
  let query = supabase
    .from('sops')
    .select(`
      *,
      sop_folders(folder_id),
      sop_assignments(user_id)
    `)
    .order('updated_at', { ascending: false });
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createSOP = async (sopData: {
  title: string;
  short_description?: string;
  content?: any;
  status: string;
  difficulty: string;
  created_by: string;
  workspace_id: string;
}) => {
  const { data, error } = await supabase
    .from('sops')
    .insert({
      title: sopData.title,
      short_description: sopData.short_description || '',
      content: sopData.content || { steps: [] },
      status: sopData.status,
      difficulty: sopData.difficulty,
      created_by: sopData.created_by,
      workspace_id: sopData.workspace_id,
      version: 1,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSOP = async (sopId: string, updates: any) => {
  const { data, error } = await supabase
    .from('sops')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sopId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSOP = async (sopId: string, userId: string, reason?: string) => {
  const { error } = await supabase
    .from('sops')
    .update({
      status: 'DELETED',
      deleted_at: new Date().toISOString(),
      deleted_by_id: userId,
      delete_reason: reason,
    })
    .eq('id', sopId);
  
  if (error) throw error;
};

export const restoreSOP = async (sopId: string) => {
  const { error } = await supabase
    .from('sops')
    .update({
      status: 'DRAFT',
      deleted_at: null,
      deleted_by_id: null,
      delete_reason: null,
    })
    .eq('id', sopId);
  
  if (error) throw error;
};

export const permanentDeleteSOP = async (sopId: string) => {
  const { error } = await supabase
    .from('sops')
    .delete()
    .eq('id', sopId);
  
  if (error) throw error;
};

// ==================== SOP RELATIONS ====================

export const assignSOPToFolder = async (sopId: string, folderId: string) => {
  const { error } = await supabase
    .from('sop_folders')
    .insert({ sop_id: sopId, folder_id: folderId });
  
  if (error) throw error;
};

export const removeSOPFromFolder = async (sopId: string, folderId: string) => {
  const { error } = await supabase
    .from('sop_folders')
    .delete()
    .eq('sop_id', sopId)
    .eq('folder_id', folderId);
  
  if (error) throw error;
};

export const assignSOPToUser = async (sopId: string, userId: string) => {
  const { error } = await supabase
    .from('sop_assignments')
    .insert({ sop_id: sopId, user_id: userId });
  
  if (error) throw error;
};

export const removeSOPFromUser = async (sopId: string, userId: string) => {
  const { error } = await supabase
    .from('sop_assignments')
    .delete()
    .eq('sop_id', sopId)
    .eq('user_id', userId);
  
  if (error) throw error;
};

// ==================== CHECKLISTS ====================

export const fetchAllChecklists = async (workspaceId?: string) => {
  let query = supabase
    .from('checklists')
    .select(`
      *,
      sops(title)
    `)
    .order('created_at', { ascending: false });
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createChecklist = async (checklistData: {
  name: string;
  sop_id: string;
  sop_version: number;
  sop_snapshot: any;
  user_id: string;
  workspace_id: string;
  notes?: string;
  due_date?: string;
}) => {
  const { data, error } = await supabase
    .from('checklists')
    .insert({
      name: checklistData.name,
      sop_id: checklistData.sop_id,
      sop_version: checklistData.sop_version,
      sop_snapshot: checklistData.sop_snapshot,
      user_id: checklistData.user_id,
      workspace_id: checklistData.workspace_id,
      notes: checklistData.notes,
      due_date: checklistData.due_date,
      status: 'ACTIVE',
      progress: 0,
      created_by: checklistData.user_id,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateChecklist = async (checklistId: string, updates: any) => {
  const { error } = await supabase
    .from('checklists')
    .update(updates)
    .eq('id', checklistId);
  
  if (error) throw error;
};

export const deleteChecklist = async (checklistId: string) => {
  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', checklistId);
  
  if (error) throw error;
};

// ==================== APPROVALS ====================

export const fetchApprovalRequests = async (workspaceId?: string) => {
  let query = supabase
    .from('approval_requests')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createApprovalRequest = async (requestData: {
  sop_id: string;
  submitted_by_id: string;
  message?: string;
  type: 'PUBLISH' | 'EDIT';
}) => {
  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      sop_id: requestData.sop_id,
      submitted_by_id: requestData.submitted_by_id,
      message: requestData.message,
      status: 'PENDING',
      type: requestData.type,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateApprovalRequest = async (
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedById: string,
  rejectionReason?: string
) => {
  const { error } = await supabase
    .from('approval_requests')
    .update({
      status,
      reviewed_by_id: reviewedById,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
    })
    .eq('id', requestId);
  
  if (error) throw error;
};

// ==================== INVITES ====================

export const fetchUserInvites = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('user_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createUserInvite = async (inviteData: {
  email: string;
  role: UserRole;
  workspace_id: string;
  invited_by: string;
  manager_id?: string;
}) => {
  const token = Math.random().toString(36).substring(7);
  const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days
  
  const { error } = await supabase
    .from('user_invites')
    .insert({
      email: inviteData.email,
      role: inviteData.role,
      status: 'PENDING',
      workspace_id: inviteData.workspace_id,
      invited_by: inviteData.invited_by,
      manager_id: inviteData.manager_id,
      token,
      expires_at: expiresAt,
    });
  
  if (error) throw error;
};

export const revokeInvite = async (inviteId: string) => {
  const { error } = await supabase
    .from('user_invites')
    .update({ status: 'REVOKED' })
    .eq('id', inviteId);
  
  if (error) throw error;
};

// ==================== ACTIVITY LOGS ====================

// Update fetchActivityLogs to limit results
export const fetchActivityLogs = async (workspaceId?: string, limit = 50) => {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};


export const createActivityLog = async (logData: {
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
}) => {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: logData.user_id,
      action: logData.action,
      entity_type: logData.entity_type,
      entity_id: logData.entity_id,
      details: logData.details,
    });
  
  if (error) throw error;
};
