
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SOP, User, UserRole } from '../../types';
import { Send, Rocket, CheckCircle, AlertCircle, X, Edit, LockOpen, Trash2, Info, Copy } from 'lucide-react';
import { ROLE_CONFIG } from '../../lib/permissions';

// --- Submit For Approval Dialog ---
interface SubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP;
  onConfirm: (message: string) => void;
}

export const SubmitForApprovalDialog: React.FC<SubmitDialogProps> = ({ isOpen, onClose, sop, onConfirm }) => {
  const [message, setMessage] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit for Approval">
      <div className="space-y-4">
        <div className="bg-monday-lightGray p-3 rounded-lg border border-monday-border">
           <h4 className="font-bold text-monday-dark text-sm mb-1">{sop.title}</h4>
           <div className="flex gap-4 text-xs text-gray-500">
             <span>Steps: {sop.steps.length}</span>
             <span>Assigned: {sop.assignedUserIds.length} users</span>
           </div>
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-monday-dark">Message to Reviewers <span className="font-normal text-gray-400">(optional)</span></label>
           <textarea className="w-full bg-white text-monday-dark border border-[#C5C7D0] rounded-lg p-3 text-sm focus:outline-none focus:border-monday-primary min-h-[100px]" placeholder="e.g. Please review the updated IT setup section..." value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded flex items-start gap-2">
           <AlertCircle size={14} className="mt-0.5 shrink-0" />
           <p>You won't be able to edit this SOP until it is approved or rejected.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
           <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Cancel</button>
           <button onClick={() => onConfirm(message)} className="px-4 py-2 bg-monday-primary text-white rounded text-sm font-medium hover:bg-monday-primaryHover flex items-center gap-2"><Send size={14} /> Submit</button>
        </div>
      </div>
    </Modal>
  );
};

// --- Submit Edit Request Dialog (NEW) ---
interface SubmitEditRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP;
  onConfirm: (reason: string) => void;
}

export const SubmitEditRequestDialog: React.FC<SubmitEditRequestDialogProps> = ({ isOpen, onClose, sop, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request to Edit SOP">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2">
           <LockOpen size={16} className="text-blue-600 mt-0.5 shrink-0" />
           <div className="text-sm text-blue-800">
             <span className="font-bold block mb-1">Locked for Editing</span>
             This SOP is currently published. To make changes, please submit a request to the workspace admins.
           </div>
        </div>
        
        <div className="space-y-2">
           <label className="text-sm font-bold text-monday-dark">Reason for Edit <span className="text-red-500">*</span></label>
           <textarea 
             className="w-full bg-white text-monday-dark border border-[#C5C7D0] rounded-lg p-3 text-sm focus:outline-none focus:border-monday-primary min-h-[100px] resize-none" 
             placeholder="e.g. Steps 4-5 are outdated due to new software update..." 
             value={reason} 
             onChange={e => setReason(e.target.value)} 
             autoFocus
           />
        </div>

        <div className="flex justify-end gap-2 pt-2">
           <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Cancel</button>
           <button 
             onClick={() => onConfirm(reason)} 
             disabled={!reason.trim()}
             className="px-4 py-2 bg-monday-primary text-white rounded text-sm font-medium hover:bg-monday-primaryHover flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Send size={14} /> Submit Request
           </button>
        </div>
      </div>
    </Modal>
  );
};

// --- Edit Published SOP Dialog ---
interface EditPublishedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP;
  onConfirm: () => void;
}

export const EditPublishedDialog: React.FC<EditPublishedDialogProps> = ({ isOpen, onClose, sop, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Published SOP">
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-blue-800 text-sm font-bold mb-1">This SOP is currently published (Version {sop.version}).</p>
          <p className="text-blue-700 text-xs">Editing will create a new <span className="font-bold">Draft Version {sop.version + 1}</span>.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">What happens next:</p>
          <ul className="text-sm text-gray-600 space-y-2">
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> The current version ({sop.version}) stays published and visible to users.</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> You will be redirected to edit the new draft.</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Once approved, the new version will replace the old one.</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
           <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
           <button onClick={onConfirm} className="px-5 py-2 bg-monday-primary text-white rounded-lg text-sm font-bold hover:bg-monday-primaryHover flex items-center gap-2 shadow-sm">
             <Copy size={16} /> Create Draft & Edit
           </button>
        </div>
      </div>
    </Modal>
  );
};


// --- Delete SOP Dialog ---
interface DeleteSOPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP;
  onConfirm: (reason: string) => void;
}

export const DeleteSOPDialog: React.FC<DeleteSOPDialogProps> = ({ isOpen, onClose, sop, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete SOP">
      <div className="space-y-5">
        <p className="text-sm text-monday-gray leading-relaxed">Are you sure you want to delete this SOP?</p>
        <div className="bg-[#F6F7FB] p-4 rounded-lg border border-[#C5C7D0] flex items-center gap-3">
           <div className="w-10 h-10 bg-white rounded border border-[#C5C7D0] flex items-center justify-center text-red-500 shrink-0"><Trash2 size={20} /></div>
           <div className="min-w-0">
             <p className="font-bold text-monday-dark text-sm truncate">{sop.title}</p>
             <p className="text-xs text-monday-gray">v{sop.version}.0 • {sop.steps.length} steps</p>
           </div>
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-monday-dark">Reason for deletion <span className="font-normal text-gray-400">(optional)</span></label>
           <textarea className="w-full bg-white text-monday-dark border border-[#C5C7D0] rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 min-h-[80px] resize-none" placeholder="e.g. Outdated procedure..." value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
           <Info size={16} className="text-monday-primary mt-0.5" />
           <p className="text-xs text-blue-800 leading-tight">This SOP will be moved to <strong>Trash</strong> and permanently deleted after 30 days. You can restore it anytime before then.</p>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
           <button onClick={onClose} className="px-4 py-2 text-monday-dark hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancel</button>
           <button onClick={() => onConfirm(reason)} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm flex items-center gap-2 transition-all">Delete SOP</button>
        </div>
      </div>
    </Modal>
  );
};

// ... Rest of existing dialogs (Approve, Reject, PublishDirectly) ...
export const PublishDirectlyDialog: React.FC<any> = ({ isOpen, onClose, sop, onConfirm }) => {
  const [note, setNote] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Directly">
      <div className="space-y-4">
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 flex items-start gap-2">
           <AlertCircle size={14} className="mt-0.5 shrink-0" />
           <div>
             <span className="font-bold block mb-0.5">Super Admin Action</span>
             You are publishing without approval. This will be immediately visible to all assigned users.
           </div>
        </div>
        <textarea className="w-full bg-white border border-[#C5C7D0] rounded-lg p-3 text-sm min-h-[80px]" placeholder="Optional note for audit log..." value={note} onChange={e => setNote(e.target.value)} />
        <button onClick={() => onConfirm(note)} className="w-full bg-monday-green text-white py-2 rounded-lg font-bold hover:bg-monday-greenHover transition-colors">Publish Now</button>
      </div>
    </Modal>
  );
};

export const ApproveDialog: React.FC<any> = ({ isOpen, onClose, sop, requestMessage, submitterName, isEditRequest, onConfirm }) => {
  const [note, setNote] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditRequest ? "Approve Edit Request" : "Approve SOP"}>
       <div className="space-y-4">
          <div className="bg-monday-lightGray p-3 rounded-lg border border-monday-border text-xs text-gray-600">
             <p><span className="font-bold text-monday-dark">Submitted by:</span> {submitterName}</p>
             {requestMessage && <p className="mt-1 italic">"{requestMessage}"</p>}
          </div>

          <textarea className="w-full bg-white border border-[#C5C7D0] rounded-lg p-3 text-sm min-h-[80px]" placeholder="Approval note (optional)..." value={note} onChange={e => setNote(e.target.value)} />
          
          <label className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
             <input type="checkbox" className="mt-1" checked={publishImmediately} onChange={e => setPublishImmediately(e.target.checked)} />
             <div className="text-sm">
                <span className="font-bold text-monday-dark block">Publish immediately</span>
                <span className="text-gray-500 text-xs">Skip the separate publish step and make it live now.</span>
             </div>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
            <button onClick={() => onConfirm(note)} className="px-6 py-2 bg-monday-green text-white rounded-lg font-bold hover:bg-monday-greenHover shadow-sm">Approve SOP</button>
          </div>
       </div>
    </Modal>
  );
};

export const RejectDialog: React.FC<any> = ({ isOpen, onClose, sop, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Request">
       <div className="space-y-4">
          <p className="text-sm text-gray-600">The author will be notified to revise the SOP based on your feedback.</p>
          <div className="space-y-1">
             <label className="text-xs font-bold text-monday-dark">Rejection Reason <span className="text-red-500">*</span></label>
             <textarea className="w-full bg-white border border-[#C5C7D0] rounded-lg p-3 text-sm min-h-[100px] focus:border-red-500 outline-none" placeholder="e.g. Please clarify step 3..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
             <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} className="px-6 py-2 bg-monday-red text-white rounded-lg font-bold hover:bg-monday-redHover shadow-sm disabled:opacity-50">Reject SOP</button>
          </div>
       </div>
    </Modal>
  );
};
