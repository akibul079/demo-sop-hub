import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SOPCard } from './components/SOPCard';
import { SOPBoardRow } from './components/SOPBoardRow';
import { SOPQuickView } from './components/SOPQuickView';
import { SOPEditor } from './components/SOPEditor';
import SettingsLayout from './components/settings/SettingsLayout';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { UploadSOPModal } from './components/UploadSOPModal';
import { ApprovalQueue } from './components/ApprovalQueue';
import { TrashView } from './components/trash/TrashView';
import { ChatModule } from './components/ChatModule';
import { EditPublishedDialog } from './components/approvals/ApprovalDialogs';
import { ChecklistList } from './components/checklist/ChecklistList';
import { ChecklistView } from './components/checklist/ChecklistView';
import { CreateChecklistDialog } from './components/checklist/CreateChecklistDialog';
import {
  Folder, SOP, SOPStatus, Difficulty, ApprovalRequest, ApprovalAction, ApprovalHistory,
  ApprovalStatus, PDFGenerationStatus, UserRole, Checklist, ChecklistStatus, User,
  UserInvite, UserActivityLog, InviteStatus, UserStatus
} from './types';
import {
  LayoutGrid, List as ListIcon, FileText, Activity,
  Loader2, Sparkles, X, Clock, MessageSquare
} from 'lucide-react';
import { canApprove } from './lib/permissions';
import { supabase } from './config/supabase';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
// Auth Components
import { AuthProvider, useAuth } from './lib/authContext';
import { AuthLayout } from './components/auth/AuthLayout';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { WorkspaceSetup } from './components/auth/WorkspaceSetup';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { handleError } from './utils/errorHandler';
// Database helpers
import * as db from './utils/database';

// Helper to map DB user to App user
const mapDBUser = (u: any): User => ({
  id: u.id,
  name: `${u.first_name} ${u.last_name}`,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${u.first_name}+${u.last_name}&background=0073EA&color=fff`,
  role: u.role as UserRole,
  status: u.status,
  jobTitle: u.job_title,
  department: u.department,
  joinedAt: u.created_at,
  workspaceId: u.workspace_id,
  managerId: u.manager_id,
  lastActiveAt: u.updated_at,
});

const Dashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState('dashboard');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [editingSOPId, setEditingSOPId] = useState<string | null>(null);
  const [quickViewSOPId, setQuickViewSOPId] = useState<string | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('board');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateChecklistModalOpen, setIsCreateChecklistModalOpen] = useState(false);
  const [initialSopForChecklist, setInitialSopForChecklist] = useState<SOP | null>(null);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [sopToVersion, setSopToVersion] = useState<SOP | null>(null);

  // Data
  const [sops, setSops] = useState<SOP[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  const isQuickViewOpen = !!quickViewSOPId;

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usersData = await db.fetchAllUsers();
      const mappedUsers = usersData.map(mapDBUser);
      setUsers(mappedUsers);

      const getUser = (id: string | null) => 
        id ? mappedUsers.find(u => u.id === id) || (currentUser as User) : undefined;

      if (currentUser?.workspaceId) {
        const invitesData = await db.fetchUserInvites(currentUser.workspaceId);
        setInvites(invitesData.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role as UserRole,
          status: inv.status as InviteStatus,
          token: inv.token,
          workspaceId: inv.workspace_id,
          invitedBy: inv.invited_by,
          invitedAt: inv.created_at,
          expiresAt: inv.expires_at,
          assignedManagerId: inv.manager_id,
        })));
      }

      const logsData = await db.fetchActivityLogs(currentUser?.workspaceId);
      setActivityLogs(logsData.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        user: getUser(log.user_id) || { name: 'Unknown', id: log.user_id } as User,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        details: log.details,
        createdAt: log.created_at,
      })));

      const foldersData = await db.fetchAllFolders(currentUser?.workspaceId);
      const mappedFolders = foldersData.map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        color: f.color,
        description: f.description,
        isOpen: f.is_open,
        sopCount: 0,
      }));
      setFolders(mappedFolders);

      const sopsData = await db.fetchAllSOPs(currentUser?.workspaceId);
      const mappedSOPs = sopsData.map((s: any) => ({
        id: s.id,
        title: s.title,
        shortDescription: s.short_description,
        steps: s.content?.steps || [],
        folderIds: s.sop_folders?.map((f: any) => f.folder_id) || [],
        assignedUserIds: s.sop_assignments?.map((a: any) => a.user_id) || [],
        tags: [],
        status: s.status as SOPStatus,
        difficulty: s.difficulty as Difficulty,
        version: s.version,
        rejectionReason: s.rejection_reason,
        activeApprovalRequestId: s.active_approval_request_id,
        updatedAt: s.updated_at,
        createdAt: s.created_at,
        createdBy: getUser(s.created_by)!,
        submittedAt: s.submitted_at,
        approvedAt: s.approved_at,
        publishedAt: s.published_at,
        stepCount: (s.content?.steps || []).length,
        coverImageUrl: s.cover_image_url,
        deletedAt: s.deleted_at,
        deletedById: s.deleted_by_id,
        deleteReason: s.delete_reason,
        permanentDeleteAt: s.permanent_delete_at,
        comments: [],
        pdfStatus: s.pdf_status,
        pdfUrl: s.pdf_url,
      }));
      setSops(mappedSOPs);

      const checklistsData = await db.fetchAllChecklists(currentUser?.workspaceId);
      setChecklists(checklistsData.map((c: any) => ({
        id: c.id,
        name: c.name,
        sopId: c.sop_id,
        sopTitle: c.sops?.title || 'Unknown',
        sopVersion: c.sop_version,
        notes: c.notes,
        dueDate: c.due_date,
        status: c.status,
        progress: c.progress,
        steps: c.sop_snapshot?.steps || [],
        createdAt: c.created_at,
        createdBy: getUser(c.created_by) || { 
          id: 'unknown', 
          name: 'Unknown User', 
          avatar: '', 
          email: '', 
          role: UserRole.MEMBER, 
          status: UserStatus.ACTIVE 
        } as User,
        resolvedAt: c.resolved_at,
        resolvedBy: c.resolved_by ? getUser(c.resolved_by) : undefined,
        finalNotes: c.final_notes,
      })));

      const reqData = await db.fetchApprovalRequests();
      setApprovalRequests(reqData.map((r: any) => ({
        id: r.id,
        sopId: r.sop_id,
        submittedBy: getUser(r.submitted_by_id) || { 
          id: 'unknown', 
          name: 'Unknown User', 
          email: '', 
          role: UserRole.MEMBER, 
          avatar: '', 
          status: UserStatus.ACTIVE, 
          workspaceId: '' 
        },
        submittedAt: r.submitted_at,
        message: r.message,
        status: r.status,
        reviewedBy: r.reviewed_by_id ? getUser(r.reviewed_by_id) : undefined,
        reviewedAt: r.reviewed_at,
        rejectionReason: r.rejection_reason,
        type: r.type,
      })));

    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (email: string, role: UserRole, managerId?: string, message?: string) => {
    try {
      if (!currentUser?.workspaceId) throw new Error('No workspace');
      await db.createUserInvite({
        email,
        role,
        workspace_id: currentUser.workspaceId,
        invited_by: currentUser.id,
        manager_id: managerId,
      });
      await db.createActivityLog({
        user_id: currentUser.id,
        action: 'USER_INVITED',
        entity_type: 'USER',
        details: { email, role },
      });
      await fetchData();
    } catch (e) {
      console.error("Invite failed", e);
      alert('Failed to send invite.');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await db.updateUserRole(userId, newRole);
      await db.createActivityLog({
        user_id: currentUser.id,
        action: 'USER_ROLE_UPDATED',
        entity_type: 'USER',
        entity_id: userId,
        details: { newRole },
      });
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to update role.');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await db.updateUserStatus(userId, UserStatus.DEACTIVATED);
      await fetchData();
    } catch (e) { console.error(e); alert('Failed to deactivate user.'); }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await db.updateUserStatus(userId, UserStatus.ACTIVE);
      await fetchData();
    } catch (e) { console.error(e); alert('Failed to reactivate user.'); }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await db.revokeInvite(inviteId);
      await fetchData();
    } catch (e) { console.error(e); alert('Failed to revoke invite.'); }
  };

  const handleResendInvite = async (inviteId: string) => {
    alert('Resent invitation email (feature to be implemented)');
  };

  if (!currentUser) return null;

  const pendingApprovalsCount = useMemo(() => {
    return approvalRequests.filter(r =>
      r.status === ApprovalStatus.PENDING && canApprove(currentUser.role, r.submittedBy.role)
    ).length;
  }, [approvalRequests, currentUser.role]);

  const handleAddComment = async (sopId: string, text: string) => {
    const comment = {
      id: `c_${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date().toISOString()
    };
    setSops(prev => prev.map(s => {
      if (s.id === sopId) return { ...s, comments: [...(s.comments || []), comment] };
      return s;
    }));
  };

  const handleCreateSOP = async () => {
    try {
      if (!currentUser?.workspaceId) throw new Error('No workspace');

      const newSOP = await db.createSOP({
        title: 'Untitled Procedure',
        short_description: '',
        content: { steps: [] },
        status: SOPStatus.DRAFT,
        difficulty: Difficulty.BEGINNER,
        created_by: currentUser.id,
        workspace_id: currentUser.workspaceId,
      });

      if (selectedFolderId) {
        await db.assignSOPToFolder(newSOP.id, selectedFolderId);
      }

      await db.assignSOPToUser(newSOP.id, currentUser.id);

      await fetchData();
      setEditingSOPId(newSOP.id);
    } catch (e: any) {
      console.error("Create SOP failed", e);
      alert("Failed to create SOP: " + (e.message || "Unknown error"));
    }
  };

  const handleEditClick = (id: string) => {
    setEditingSOPId(id);
  };

  const handleCreateNewVersion = async (originalSop: SOP) => {
    try {
      if (!currentUser?.workspaceId) throw new Error('No workspace');

      const newSOP = await db.createSOP({
        title: originalSop.title,
        short_description: originalSop.shortDescription,
        content: { steps: originalSop.steps },
        status: SOPStatus.DRAFT,
        difficulty: originalSop.difficulty,
        created_by: currentUser.id,
        workspace_id: currentUser.workspaceId,
      });

      if (originalSop.folderIds && originalSop.folderIds.length > 0) {
        for (const fid of originalSop.folderIds) {
          await db.assignSOPToFolder(newSOP.id, fid);
        }
      }

      if (originalSop.assignedUserIds && originalSop.assignedUserIds.length > 0) {
        for (const uid of originalSop.assignedUserIds) {
          await db.assignSOPToUser(newSOP.id, uid);
        }
      }

      await fetchData();
      setSopToVersion(null);
      setEditingSOPId(newSOP.id);
    } catch (e) {
      console.error("Create new version failed", e);
      alert("Failed to create new version");
    }
  };

  const handleDuplicateSOP = async (sop: SOP) => {
    try {
      if (!currentUser?.workspaceId) throw new Error('No workspace');

      const newSOP = await db.createSOP({
        title: `${sop.title} (Copy)`,
        short_description: sop.shortDescription,
        content: { steps: sop.steps },
        status: SOPStatus.DRAFT,
        difficulty: sop.difficulty,
        created_by: currentUser.id,
        workspace_id: currentUser.workspaceId,
      });

      if (sop.folderIds && sop.folderIds.length > 0) {
        for (const fid of sop.folderIds) {
          await db.assignSOPToFolder(newSOP.id, fid);
        }
      }

      await db.assignSOPToUser(newSOP.id, currentUser.id);
      await fetchData();
    } catch (e) {
      console.error("Duplicate SOP failed", e);
      alert("Failed to duplicate SOP");
    }
  };

  const handleSaveSOP = async (updatedSop: SOP) => {
    setSops(prev => prev.map(s => s.id === updatedSop.id ? updatedSop : s));
    
    try {
      await db.updateSOP(updatedSop.id, {
        title: updatedSop.title,
        short_description: updatedSop.shortDescription,
        content: { steps: updatedSop.steps },
        cover_image_url: updatedSop.coverImageUrl,
      });

      // Update folder assignments
      const { data: currentFolders } = await supabase
        .from('sop_folders')
        .select('folder_id')
        .eq('sop_id', updatedSop.id);

      const currentFolderIds = currentFolders?.map(f => f.folder_id) || [];
      const newFolderIds = updatedSop.folderIds || [];

      const toRemove = currentFolderIds.filter(id => !newFolderIds.includes(id));
      const toAdd = newFolderIds.filter(id => !currentFolderIds.includes(id));

      for (const fid of toRemove) {
        await db.removeSOPFromFolder(updatedSop.id, fid);
      }
      for (const fid of toAdd) {
        await db.assignSOPToFolder(updatedSop.id, fid);
      }

      // Update user assignments
      const { data: currentAssignments } = await supabase
        .from('sop_assignments')
        .select('user_id')
        .eq('sop_id', updatedSop.id);

      const currentUserIds = currentAssignments?.map(a => a.user_id) || [];
      const newUserIds = updatedSop.assignedUserIds || [];

      const usersToRemove = currentUserIds.filter(id => !newUserIds.includes(id));
      const usersToAdd = newUserIds.filter(id => !currentUserIds.includes(id));

      for (const uid of usersToRemove) {
        await db.removeSOPFromUser(updatedSop.id, uid);
      }
      for (const uid of usersToAdd) {
        await db.assignSOPToUser(updatedSop.id, uid);
      }

    } catch (e) {
      console.error("Save error", e);
      alert("Failed to save SOP");
    }
  };

  const handleSubmitForApproval = async (sopData: SOP, message: string) => {
    try {
      const req = await db.createApprovalRequest({
        sop_id: sopData.id,
        submitted_by_id: currentUser.id,
        message: message,
        type: 'PUBLISH',
      });

      await db.updateSOP(sopData.id, {
        title: sopData.title,
        short_description: sopData.shortDescription,
        content: { steps: sopData.steps },
        status: SOPStatus.PENDING_APPROVAL,
        active_approval_request_id: req.id,
        submitted_at: new Date().toISOString(),
      });

      await fetchData();
      setEditingSOPId(null);
      setActivePath('waiting-for-approval');
      setSelectedFolderId(null);
    } catch (e) {
      console.error("Submit error", e);
      alert("Failed to submit for approval");
    }
  };

  const handlePublishDirectly = async (sopData: SOP, note: string) => {
    try {
      await db.updateSOP(sopData.id, {
        title: sopData.title,
        short_description: sopData.shortDescription,
        content: { steps: sopData.steps },
        status: SOPStatus.PUBLISHED,
        published_at: new Date().toISOString(),
      });

      await fetchData();
      setEditingSOPId(null);
      setActivePath('library');
    } catch (e) {
      console.error(e);
      alert("Failed to publish SOP");
    }
  };

  const handleDeleteSOP = async (id: string, reason: string) => {
    try {
      await db.deleteSOP(id, currentUser.id, reason);
      setSops(prev => prev.map(s => s.id === id ? { ...s, status: SOPStatus.DELETED } : s));
      setEditingSOPId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete SOP");
    }
  };

  const handleRestoreSOP = async (id: string) => {
    try {
      await db.restoreSOP(id);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to restore SOP");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await db.permanentDeleteSOP(id);
      setSops(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to permanently delete SOP");
    }
  };

  const handleStartChecklistAction = (sop: SOP) => {
    setInitialSopForChecklist(sop);
    setIsCreateChecklistModalOpen(true);
  };

  const handleCreateChecklist = async (data: { name: string; sopId: string; notes?: string; dueDate?: string }) => {
    try {
      if (!currentUser?.workspaceId) throw new Error('No workspace');
      
      const sop = sops.find(s => s.id === data.sopId);
      if (!sop) return;

      const chk = await db.createChecklist({
        name: data.name,
        sop_id: sop.id,
        sop_version: sop.version,
        sop_snapshot: { steps: sop.steps },
        user_id: currentUser.id,
        workspace_id: currentUser.workspaceId,
        notes: data.notes,
        due_date: data.dueDate,
      });

      await fetchData();
      setSelectedChecklistId(chk.id);
      setActivePath('checklist-view');
      setQuickViewSOPId(null);
      setEditingSOPId(null);
    } catch (e) {
      console.error("Create checklist failed", e);
      alert("Failed to create checklist");
    }
  };

  const handleToggleChecklistStep = async (stepId: string) => {
    if (!selectedChecklistId) return;
    
    const checklist = checklists.find(c => c.id === selectedChecklistId);
    if (!checklist) return;

    const newSteps = checklist.steps.map(s => {
      if (s.id !== stepId) return s;
      const isNowCompleted = !s.isCompleted;
      return {
        ...s,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        completedBy: isNowCompleted ? currentUser : undefined,
      };
    });

    const completedCount = newSteps.filter(s => s.isCompleted).length;
    const progress = Math.round((completedCount / newSteps.length) * 100);
    const status = completedCount === newSteps.length ? ChecklistStatus.COMPLETED : ChecklistStatus.ACTIVE;

    setChecklists(prev => prev.map(c => 
      c.id === selectedChecklistId ? { ...c, steps: newSteps, progress, status } : c
    ));

    try {
      await db.updateChecklist(selectedChecklistId, {
        progress,
        status: checklist.status === ChecklistStatus.RESOLVED ? ChecklistStatus.RESOLVED : status,
      });
    } catch (e) {
      console.error("Toggle step failed", e);
    }
  };

  const handleResolveChecklist = async (notes: string) => {
    if (!selectedChecklistId) return;

    const resolvedDate = new Date().toISOString();
    setChecklists(prev => prev.map(c =>
      c.id === selectedChecklistId
        ? {
            ...c,
            status: ChecklistStatus.RESOLVED,
            resolvedAt: resolvedDate,
            resolvedBy: currentUser,
            finalNotes: notes
          }
        : c
    ));

    try {
      await db.updateChecklist(selectedChecklistId, {
        status: ChecklistStatus.RESOLVED,
        resolved_at: resolvedDate,
        resolved_by_id: currentUser.id,
        final_notes: notes,
      });

      await fetchData();
      setActivePath('checklists');
      setSelectedChecklistId(null);
    } catch (e) {
      console.error("Resolve checklist failed", e);
      alert("Failed to resolve checklist");
    }
  };

  const handleResetChecklist = async (id: string) => {
    try {
      const checklist = checklists.find(c => c.id === id);
      if (!checklist) return;

      const resetSteps = checklist.steps.map(s => ({ 
        ...s, 
        isCompleted: false, 
        completedAt: undefined, 
        completedBy: undefined 
      }));

      await db.updateChecklist(id, {
        status: ChecklistStatus.ACTIVE,
        progress: 0,
        resolved_at: null,
        final_notes: null,
      });

      await fetchData();
    } catch (e) {
      console.error("Reset checklist failed", e);
      alert("Failed to reset checklist");
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    try {
      await db.deleteChecklist(id);
      setChecklists(prev => prev.filter(c => c.id !== id));
      setActivePath('checklists');
      setSelectedChecklistId(null);
    } catch (e) {
      console.error("Delete checklist failed", e);
      alert("Failed to delete checklist");
    }
  };

  const handleApprove = async (requestId: string, note: string, shouldRedirect: boolean = true) => {
    try {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) return;

      await db.updateApprovalRequest(requestId, 'APPROVED', currentUser.id, note);

      if (request.type === 'PUBLISH') {
        await db.updateSOP(request.sopId, {
          status: SOPStatus.APPROVED,
          approved_at: new Date().toISOString(),
          active_approval_request_id: null,
        });
      }

      await fetchData();
      if (shouldRedirect) {
        setEditingSOPId(null);
        setActivePath('dashboard');
      }
    } catch (e) {
      console.error("Approve failed", e);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string, reason: string, shouldRedirect: boolean = true) => {
    try {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) return;

      await db.updateApprovalRequest(requestId, 'REJECTED', currentUser.id, reason);

      if (request.type === 'PUBLISH') {
        await db.updateSOP(request.sopId, {
          status: SOPStatus.REJECTED,
          active_approval_request_id: null,
          rejection_reason: reason,
        });
      }

      await fetchData();
      if (shouldRedirect) {
        setEditingSOPId(null);
        setActivePath('dashboard');
      }
    } catch (e) {      console.error("Reject failed", e);
      alert("Failed to reject request");
    }
  };

  const filteredSOPs = useMemo(() => {
    if (activePath === 'waiting-for-approval') {
      return sops.filter(s => s.status === SOPStatus.PENDING_APPROVAL && s.createdBy.id === currentUser.id);
    }
    return sops.filter(s => {
      if (activePath === 'trash') return s.status === SOPStatus.DELETED;
      if (s.status === SOPStatus.DELETED) return false;
      if (selectedFolderId) return s.folderIds.includes(selectedFolderId);
      return true;
    });
  }, [sops, selectedFolderId, activePath, currentUser.id]);

  if (editingSOPId) {
    const sop = sops.find(s => s.id === editingSOPId);
    return (
      <SOPEditor
        sop={sop || null}
        folders={folders}
        users={users}
        currentUser={currentUser}
        history={approvalHistory}
        onBack={() => { setEditingSOPId(null); fetchData(); }}
        onSave={handleSaveSOP}
        onSubmit={handleSubmitForApproval}
        onPublishDirectly={handlePublishDirectly}
        onDelete={handleDeleteSOP}
        onDuplicate={handleDuplicateSOP}
        onEdit={() => sop && handleCreateNewVersion(sop)}
        onRequestEdit={() => { }}
        onAddComment={handleAddComment}
        onStartChecklist={handleStartChecklistAction}
        onApproveRequest={(id, note) => handleApprove(id, note, true)}
        onRejectRequest={(id, reason) => handleReject(id, reason, true)}
      />
    );
  }

  if (activePath === 'checklist-view' && selectedChecklistId) {
    const checklist = checklists.find(c => c.id === selectedChecklistId);
    if (checklist) {
      return (
        <ChecklistView
          checklist={checklist}
          onBack={() => setActivePath('checklists')}
          onToggleStep={handleToggleChecklistStep}
          onResolve={handleResolveChecklist}
          onReset={handleResetChecklist}
          onDelete={handleDeleteChecklist}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-white font-sans text-monday-dark">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        folders={folders}
        activeFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        activePath={activePath}
        onNavigate={setActivePath}
        onCreateFolder={(parentId) => {
          if (parentId !== undefined) setSelectedFolderId(parentId);
          setIsFolderModalOpen(true);
        }}
        onDeleteFolder={() => { }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
        approvalCount={pendingApprovalsCount}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          user={currentUser}
          onMenuClick={() => setMobileMenuOpen(true)}
          onCreateClick={handleCreateSOP}
          onUploadClick={() => setIsUploadModalOpen(true)}
        />

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {activePath === 'trash' ? (
            <TrashView
              sops={filteredSOPs}
              onRestore={handleRestoreSOP}
              onPermanentDelete={handlePermanentDelete}
            />
          ) : activePath === 'checklists' ? (
            <ChecklistList
              checklists={checklists}
              onSelect={(id) => { setSelectedChecklistId(id); setActivePath('checklist-view'); }}
              onCreateNew={() => { setInitialSopForChecklist(null); setIsCreateChecklistModalOpen(true); }}
            />
          ) : activePath === 'checklist-view' && selectedChecklistId ? (
            checklists.find(c => c.id === selectedChecklistId) ? (
              <ChecklistView
                checklist={checklists.find(c => c.id === selectedChecklistId)!}
                onBack={() => { setActivePath('checklists'); setSelectedChecklistId(null); }}
                onToggleStep={handleToggleChecklistStep}
                onResolve={handleResolveChecklist}
                onDelete={handleDeleteChecklist}
                onReset={handleResetChecklist}
              />
            ) : <div>Checklist not found</div>
          ) : activePath === 'dashboard' || activePath === 'library' || activePath === 'waiting-for-approval' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 max-w-[1600px] mx-auto w-full animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-monday-dark mb-1">
                    {activePath === 'waiting-for-approval'
                      ? 'Waiting for Approval'
                      : selectedFolderId
                      ? folders.find(f => f.id === selectedFolderId)?.name
                      : 'All SOPs'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {activePath === 'waiting-for-approval'
                      ? 'Your SOPs currently under review'
                      : 'Manage company procedures'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-monday-primary text-white' : 'text-gray-500'}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode('board')} className={`p-1.5 rounded ${viewMode === 'board' ? 'bg-monday-primary text-white' : 'text-gray-500'}`}><ListIcon size={18} /></button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-monday-primary" size={32} /></div>
              ) : filteredSOPs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-monday-border border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    {activePath === 'waiting-for-approval' ? <Clock size={32} /> : <FileText size={32} />}
                  </div>
                  <p className="text-gray-500 mb-2">No SOPs found.</p>
                  {activePath !== 'waiting-for-approval' && <p className="text-gray-400 text-sm">Create a new SOP or upload a file to get started.</p>}
                </div>
              ) : (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSOPs.map(sop => (
                      <SOPCard
                        key={sop.id}
                        sop={sop}
                        onClick={() => setQuickViewSOPId(sop.id)}
                        onEdit={() => handleEditClick(sop.id)}
                        onDuplicate={() => handleDuplicateSOP(sop)}
                        onDelete={(reason) => handleDeleteSOP(sop.id, reason)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-monday-border overflow-hidden">
                    <div className="grid grid-cols-12 gap-0 bg-gray-50 border-b border-monday-border text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-2">
                      <div className="col-span-12 md:col-span-4 pl-4">Title</div>
                      <div className="col-span-6 md:col-span-2 text-center">Status</div>
                      <div className="col-span-3 md:col-span-2 hidden md:block px-3">Folder</div>
                      <div className="col-span-2 hidden md:block text-center">People</div>
                      <div className="col-span-3 md:col-span-2 hidden md:block text-center">Last Updated</div>
                    </div>
                    {filteredSOPs.map(sop => (
                      <SOPBoardRow
                        key={sop.id}
                        sop={sop}
                        folders={folders}
                        users={users}
                        onClick={() => setQuickViewSOPId(sop.id)}
                        onEdit={() => handleEditClick(sop.id)}
                        onDuplicate={() => handleDuplicateSOP(sop)}
                        onDelete={(reason) => handleDeleteSOP(sop.id, reason)}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          ) : activePath === 'approvals' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ApprovalQueue
                currentUser={currentUser}
                requests={approvalRequests}
                sops={sops}
                onApprove={(id, note) => handleApprove(id, note, false)}
                onReject={(id, reason) => handleReject(id, reason, false)}
                onViewSOP={(id) => setEditingSOPId(id)}
              />
            </div>
          ) : activePath === 'settings' ? (
            <SettingsLayout
              user={currentUser}
              users={users}
              invites={invites}
              activityLogs={activityLogs}
              onInvite={handleInviteUser}
              onChangeRole={handleChangeRole}
              onDeactivate={handleDeactivateUser}
              onReactivate={handleReactivateUser}
              onRevokeInvite={handleRevokeInvite}
              onResendInvite={handleResendInvite}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Activity size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-medium capitalize">{activePath}</h3>
            </div>
          )}
        </main>

        <button
          onClick={() => setShowChatWidget(!showChatWidget)}
          className={`fixed bottom-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 active:scale-95 ${isQuickViewOpen ? 'right-[500px]' : 'right-6'}`}
        >
          {showChatWidget ? <X size={24} /> : <Sparkles size={24} />}
        </button>

        {showChatWidget && (
          <div className={`fixed bottom-24 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-slideInRight origin-bottom-right transition-all duration-300 ${isQuickViewOpen ? 'right-[500px]' : 'right-6'}`}>
            <ChatModule currentUser={currentUser} sops={sops} onClose={() => setShowChatWidget(false)} />
          </div>
        )}

        {quickViewSOPId && (
          <SOPQuickView
            sop={sops.find(s => s.id === quickViewSOPId)!}
            onClose={() => setQuickViewSOPId(null)}
            onOpenFull={() => { setEditingSOPId(quickViewSOPId); setQuickViewSOPId(null); }}
            onAddComment={handleAddComment}
            onStartChecklist={handleStartChecklistAction}
          />
        )}
      </div>

      <CreateFolderDialog
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreate={async (folderData) => {
          if (!currentUser?.workspaceId) return;
          const data = await db.createFolder({
            name: folderData.name,
            description: folderData.description,
            parent_id: folderData.parentId || null,
            color: folderData.color,
            workspace_id: currentUser.workspaceId,
          });
          setFolders(prev => [...prev, {
            id: data.id,
            name: data.name,
            parentId: data.parent_id,
            isOpen: true,
            color: data.color,
            description: data.description,
            sopCount: 0,
          }]);
        }}
        folders={folders}
        defaultParentId={selectedFolderId}
      />

      <UploadSOPModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        workspaceId={currentUser.workspaceId || ""}
        onConfirm={async (data) => {
          if (!currentUser?.workspaceId) return;
          await db.createSOP({
            title: data.title,
            short_description: data.shortDescription,
            content: { steps: data.steps },
            status: data.status,
            difficulty: Difficulty.BEGINNER,
            created_by: currentUser.id,
            workspace_id: currentUser.workspaceId,
          });
          await fetchData();
        }}
      />

      <CreateChecklistDialog
        isOpen={isCreateChecklistModalOpen}
        onClose={() => setIsCreateChecklistModalOpen(false)}
        sops={sops}
        initialSop={initialSopForChecklist}
        onCreate={handleCreateChecklist}
      />

      {sopToVersion && (
        <EditPublishedDialog
          isOpen={!!sopToVersion}
          onClose={() => setSopToVersion(null)}
          sop={sopToVersion}
          onConfirm={() => handleCreateNewVersion(sopToVersion)}
        />
      )}
    </div>
  );
};

const AuthRouter = () => {
  const { user, workspace, isLoading } = useAuth();
  const [authPage, setAuthPage] = useState('login');

  // TEMPORARY: Skip loading check to debug
  // if (isLoading) {
  //   return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-monday-primary" /></div>;
  // }

  if (user && workspace) {
    return <Dashboard />;
  }

  if (user && !workspace) {
    return <AuthLayout><WorkspaceSetup /></AuthLayout>;
  }

  return (
    <AuthLayout>
      {authPage === 'login' && <Login onNavigate={setAuthPage} />}
      {authPage === 'signup' && <Signup onNavigate={setAuthPage} />}
      {authPage === 'verify-email' && <VerifyEmail onNavigate={setAuthPage} />}
      {authPage === 'forgot-password' && <ForgotPassword onNavigate={setAuthPage} />}
    </AuthLayout>
  );
};


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
};



export default App;

      
