import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Folder, Users, Loader2, FileDown, Edit,
  CheckCircle, XCircle, Copy, MessageSquare, ClipboardCheck, Send
} from 'lucide-react';
import { SOP, SOPStatus, SOPStep, Folder as FolderType, User as UserType, ApprovalHistory, PDFGenerationStatus } from '../types';
import { SOPActionButtons } from './SOPActionButtons';
import { ApprovalHistoryTimeline } from './approvals/ApprovalHistoryTimeline';
import { CoverImageUpload } from './ui/CoverImageUpload';
import { DeleteSOPDialog, ApproveDialog, RejectDialog, SubmitEditRequestDialog, EditPublishedDialog } from './approvals/ApprovalDialogs';
import { canPublishDirectly } from '../lib/permissions';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { TiptapEditor } from './ui/TiptapEditor';

interface SOPEditorProps {
  sop: SOP | null;
  folders: FolderType[];
  users: UserType[];
  currentUser: UserType;
  history: ApprovalHistory[];
  onBack: () => void;
  onSave: (sop: SOP) => void;
  onSubmit: (sop: SOP, message: string) => void;
  onPublishDirectly: (sop: SOP, note: string) => void;
  onDelete: (id: string, reason: string) => void;
  onDuplicate: (sop: SOP) => void;
  onEdit: () => void; // Used for direct version creation (super admin)
  onRequestEdit: (sopId: string, reason: string) => void; // New prop for request flow
  onApproveRequest?: (requestId: string, note: string) => void;
  onRejectRequest?: (requestId: string, reason: string) => void;
  onAddComment?: (sopId: string, text: string) => void;
  onStartChecklist?: (sop: SOP) => void;
}

// --- Step Editor (Wrapper for Tiptap) ---

const StepEditor: React.FC<{
  step: SOPStep,
  onChange: (step: SOPStep) => void,
  onDelete: () => void,
  index: number,
  readOnly?: boolean
}> = ({ step, onChange, onDelete, index, readOnly }) => {
  const [expanded, setExpanded] = useState(true);

  // Helper to ensure step.description is a string
  const initialContent = typeof step.description === 'string' ? step.description : (step.description ? '<p>Legacy Content</p>' : '');

  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm mb-4 ${readOnly ? 'opacity-90' : ''}`}>
      <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`cursor-move text-gray-400 ${readOnly ? 'invisible' : ''}`}><GripVertical size={16} /></div>
        <div className="flex-1 font-medium text-black flex items-center gap-2">
          <span className="text-gray-500 font-mono text-xs">{index + 1}.</span>
          <input
            type="text"
            value={step.title}
            readOnly={readOnly}
            onClick={e => e.stopPropagation()}
            onChange={e => onChange({ ...step, title: e.target.value })}
            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-black rounded-sm px-2 py-1 text-sm font-semibold w-full text-black"
            placeholder="Step Title"
          />
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>}
          <button className="text-gray-400 p-1">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </div>
      </div>
      {expanded && (
        <div className="bg-white p-2">
          <TiptapEditor
            content={initialContent}
            onChange={(html) => onChange({ ...step, description: html })}
            editable={!readOnly}
            placeholder="Describe this step..."
            className="min-h-[150px] border-none shadow-none"
          />
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export const SOPEditor: React.FC<SOPEditorProps> = ({
  sop, folders, users, currentUser, history,
  onBack, onSave, onSubmit, onPublishDirectly, onDelete, onDuplicate, onEdit, onRequestEdit,
  onApproveRequest, onRejectRequest, onAddComment, onStartChecklist
}) => {
  if (!sop) return <div className="p-10 text-center">Loading...</div>;
  const [formState, setFormState] = useState<SOP>(sop);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  // Review Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Edit Dialogs
  const [showRequestEditDialog, setShowRequestEditDialog] = useState(false);
  const [showDirectEditDialog, setShowDirectEditDialog] = useState(false);

  // Comments
  const [commentText, setCommentText] = useState('');

  // Header Dropdown
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target as Node)) {
        setShowActionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load sync
  useEffect(() => {
    if (sop && sop.id !== formState.id) {
      setFormState(sop);
    }
  }, [sop?.id]);

  // Watch for external comment updates
  useEffect(() => {
    if (sop) {
      setFormState(prev => ({ ...prev, comments: sop.comments }));
    }
  }, [sop]);

  const isReadOnly = formState.status !== SOPStatus.DRAFT && formState.status !== SOPStatus.REJECTED;
  const isPublished = formState.status === SOPStatus.PUBLISHED || formState.status === SOPStatus.APPROVED;
  const isPendingApproval = formState.status === SOPStatus.PENDING_APPROVAL;
  const canReview = isPendingApproval && onApproveRequest && onRejectRequest;

  const updateField = (field: keyof SOP, value: any) => {
    if (isReadOnly) return;
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const addStep = () => {
    if (isReadOnly) return;
    const newStep: SOPStep = { id: `new_${Date.now()}`, title: 'New Step', description: '', order: formState.steps.length };
    setFormState(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const toggleUserId = (userId: string) => {
    if (isReadOnly) return;
    const current = formState.assignedUserIds || [];
    const updated = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId];
    updateField('assignedUserIds', updated);
  };

  const handleSendComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(formState.id, commentText);
      setCommentText('');
    }
  };

  const statusColors = {
    [SOPStatus.DRAFT]: 'bg-gray-200 text-gray-700',
    [SOPStatus.PENDING_APPROVAL]: 'bg-monday-yellow text-white',
    [SOPStatus.APPROVED]: 'bg-monday-green text-white',
    [SOPStatus.PUBLISHED]: 'bg-monday-primary text-white',
    [SOPStatus.REJECTED]: 'bg-monday-red text-white',
    [SOPStatus.ARCHIVED]: 'bg-gray-700 text-white',
    [SOPStatus.DELETED]: 'bg-red-600 text-white',
  };

  const handleEditClick = () => {
    if (canPublishDirectly(currentUser.role)) {
      // Super Admin -> Direct Edit Flow
      setShowDirectEditDialog(true);
    } else {
      // Regular User -> Request Flow
      setShowRequestEditDialog(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F6F7FB] text-black">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={20} /></button>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[formState.status]}`}>
            {formState.status.replace('_', ' ')}
          </span>
          {formState.pdfUrl && (
            <a href={formState.pdfUrl} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-monday-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
              <FileDown size={14} /> PDF Ready
            </a>
          )}
          {formState.pdfStatus === PDFGenerationStatus.PROCESSING && (
            <div className="flex items-center gap-2 text-xs text-monday-yellow font-bold animate-pulse">
              <Loader2 size={12} className="animate-spin" /> Generating PDF...
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">

          {/* Instant Checklist Button */}
          {isPublished && onStartChecklist && (
            <button
              onClick={() => onStartChecklist(formState)}
              className="flex items-center gap-2 bg-monday-green text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-monday-greenHover transition-colors shadow-sm"
            >
              <ClipboardCheck size={16} /> Start Checklist
            </button>
          )}

          {/* Review Actions (Approve/Reject) */}
          {canReview && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => setShowRejectDialog(true)}
                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => setShowApproveDialog(true)}
                className="flex items-center gap-2 bg-monday-green text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-monday-greenHover transition-colors shadow-sm"
              >
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          )}

          {/* Edit Button (For Published/Approved SOPs) */}
          {isReadOnly && !isPendingApproval && (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 bg-monday-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-monday-primaryHover transition-colors shadow-sm"
            >
              <Edit size={16} /> Edit SOP
            </button>
          )}

          {/* Standard Save/Submit Buttons */}
          {!isReadOnly && !isPendingApproval && (
            <SOPActionButtons
              sop={formState}
              currentUser={currentUser}
              onSave={() => onSave(formState)}
              onSubmit={onSubmit}
              onPublishDirectly={onPublishDirectly}
              onDuplicate={() => onDuplicate(formState)}
            />
          )}

          {/* Actions Dropdown */}
          <div className="relative" ref={actionsDropdownRef}>
            <button
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1"
            >
              Actions <ChevronDown size={14} />
            </button>

            {showActionsDropdown && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-monday-border z-50 animate-fadeIn overflow-hidden">
                <button onClick={() => { onDuplicate(formState); setShowActionsDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700">
                  <Copy size={16} className="text-gray-500" /> Duplicate to Draft
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assignments</div>

                <button onClick={() => { setShowFolderPicker(true); setShowActionsDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                  <Folder size={16} className="text-gray-400" /> Folders
                </button>
                <button onClick={() => { setShowUserPicker(true); setShowActionsDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                  <Users size={16} className="text-gray-400" /> Assigned Users
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button onClick={() => { setShowDeleteDialog(true); setShowActionsDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <CoverImageUpload
              imageUrl={formState.coverImageUrl}
              onChange={url => updateField('coverImageUrl', url)}
              readOnly={isReadOnly}
            />

            <div className={`bg-white p-6 rounded-xl border border-[#C5C7D0] shadow-sm space-y-4 ${isReadOnly ? 'bg-gray-50' : ''}`}>
              <input type="text" value={formState.title} readOnly={isReadOnly} onChange={e => updateField('title', e.target.value)} className="text-3xl font-bold text-monday-dark w-full border-none focus:outline-none focus:ring-1 focus:ring-monday-primary rounded-sm p-1 placeholder-gray-300 bg-transparent" placeholder="SOP Title" />
              <textarea value={formState.shortDescription} readOnly={isReadOnly} onChange={e => updateField('shortDescription', e.target.value)} className="w-full text-monday-gray border-none focus:outline-none focus:ring-1 focus:ring-monday-primary p-1 resize-none text-base bg-transparent rounded-sm" placeholder="Add a short description..." rows={2} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-monday-dark mb-4">Procedure Steps</h3>
              <div className="space-y-4">
                <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-600 rounded">Error rendering steps. Please refresh or delete last step.</div>}>
                  {formState.steps.map((step, idx) => (
                    <StepEditor
                      key={step.id}
                      index={idx}
                      step={step}
                      readOnly={isReadOnly}
                      onChange={s => { const steps = [...formState.steps]; steps[idx] = s; updateField('steps', steps); }}
                      onDelete={() => updateField('steps', formState.steps.filter((_, i) => i !== idx))}
                    />
                  ))}
                </ErrorBoundary>
              </div>
              {!isReadOnly && <button onClick={addStep} className="w-full py-4 mt-4 border-2 border-dashed border-[#C5C7D0] rounded-lg text-gray-400 font-medium hover:border-monday-primary hover:text-monday-primary hover:bg-white flex items-center justify-center gap-2 transition-all"><Plus size={20} /> Add Step</button>}
            </div>
          </div>
        </div>

        <aside className="w-full md:w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Assignments</label>

              {/* Folders */}
              <div className={`space-y-4 mb-6 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-monday-dark flex items-center gap-2"><Folder size={14} /> Folders</span>
                    {!isReadOnly && <button onClick={() => setShowFolderPicker(!showFolderPicker)} className="text-monday-primary text-[11px] font-bold hover:underline">+ Add</button>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {folders.filter(f => formState.folderIds.includes(f.id)).map(f => (
                      <span key={f.id} className="inline-flex items-center px-2 py-1 rounded bg-black text-white text-[10px] font-bold shadow-sm">{f.name}</span>
                    ))}
                  </div>
                  {showFolderPicker && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-2 animate-fadeIn max-h-48 overflow-y-auto">
                      {folders.map(f => (
                        <label key={f.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={formState.folderIds.includes(f.id)}
                            onChange={() => {
                              const current = formState.folderIds;
                              const updated = current.includes(f.id) ? current.filter(id => id !== f.id) : [...current, f.id];
                              updateField('folderIds', updated);
                            }}
                          />
                          {f.name}

                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Users */}
              <div className={`space-y-4 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-monday-dark flex items-center gap-2"><Users size={14} /> Assigned Users</span>
                    {!isReadOnly && <button onClick={() => setShowUserPicker(!showUserPicker)} className="text-monday-primary text-[11px] font-bold hover:underline">+ Add</button>}
                  </div>
                  <div className="flex -space-x-2 overflow-hidden py-1 pl-1">
                    {users.filter(u => formState.assignedUserIds?.includes(u.id)).map(u => (
                      <img key={u.id} src={u.avatar} title={u.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" alt="" />
                    ))}
                  </div>
                  {showUserPicker && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-2 animate-fadeIn max-h-48 overflow-y-auto">
                      {users.map(u => (
                        <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={formState.assignedUserIds?.includes(u.id)}
                            onChange={() => toggleUserId(u.id)}
                          />
                          <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                          {u.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b border-gray-100 pb-1">Metadata</label>
              <div className="text-[10px] text-gray-500 space-y-2 uppercase font-bold">
                <div className="flex justify-between"><span>Created</span><span className="text-monday-dark">{new Date(formState.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span>Version</span><span className="text-monday-dark">{formState.version}.0</span></div>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b border-gray-100 pb-1 flex items-center gap-1">
                <MessageSquare size={10} /> Comments
              </label>

              <div className="space-y-3 mb-3 max-h-64 overflow-y-auto custom-scrollbar">
                {formState.comments && formState.comments.length > 0 ? (
                  formState.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={comment.author.avatar} className="w-4 h-4 rounded-full" alt="" />
                        <span className="text-xs font-bold text-gray-700">{comment.author.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No comments yet.</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-monday-primary"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="absolute right-1.5 top-1.5 text-monday-primary disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b border-gray-100 pb-1">Timeline</label>
              <ApprovalHistoryTimeline history={history} />
            </div>
          </div>
        </aside>
      </div>

      <DeleteSOPDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        sop={formState}
        onConfirm={reason => { onDelete(formState.id, reason); setShowDeleteDialog(false); }}
      />

      <SubmitEditRequestDialog
        isOpen={showRequestEditDialog}
        onClose={() => setShowRequestEditDialog(false)}
        sop={formState}
        onConfirm={(reason) => { onRequestEdit(formState.id, reason); setShowRequestEditDialog(false); }}
      />

      <EditPublishedDialog
        isOpen={showDirectEditDialog}
        onClose={() => setShowDirectEditDialog(false)}
        sop={formState}
        onConfirm={() => { onEdit(); setShowDirectEditDialog(false); }}
      />

      {showApproveDialog && canReview && (
        <ApproveDialog
          isOpen={true}
          onClose={() => setShowApproveDialog(false)}
          sop={formState}
          submitterName="User"
          onConfirm={(note: string) => {
            if (formState.activeApprovalRequestId && onApproveRequest) {
              onApproveRequest(formState.activeApprovalRequestId, note);
            }
            setShowApproveDialog(false);
          }}
        />
      )}

      {showRejectDialog && canReview && (
        <RejectDialog
          isOpen={true}
          onClose={() => setShowRejectDialog(false)}
          sop={formState}
          submitterName="User"
          onConfirm={(reason: string) => {
            if (formState.activeApprovalRequestId && onRejectRequest) {
              onRejectRequest(formState.activeApprovalRequestId, reason);
            }
            setShowRejectDialog(false);
          }}
        />
      )}
    </div>
  );
};
