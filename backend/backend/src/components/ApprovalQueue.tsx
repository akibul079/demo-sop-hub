
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, CheckCircle, LockOpen, Filter, Search, FileText } from 'lucide-react';
import { ApprovalRequest, User, UserRole, SOP } from '../types';
import { RoleBadge } from './users/RoleBadge';
import { ApproveDialog, RejectDialog } from './approvals/ApprovalDialogs';
import { canApprove } from '../lib/permissions';

interface ApprovalQueueProps {
  currentUser: User;
  requests: ApprovalRequest[];
  sops: SOP[];
  onApprove: (requestId: string, note: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onViewSOP: (sopId: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  currentUser, requests, sops, onApprove, onReject, onViewSOP
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'my-submissions'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Filter requests approvable by current user
  const incomingRequests = requests.filter(r =>
    r.status === 'PENDING' && canApprove(currentUser.role, r.submittedBy?.role || UserRole.MEMBER)
  );

  const mySubmissions = requests.filter(r => r.submittedBy.id === currentUser.id);

  const displayedRequests = activeTab === 'pending' ? incomingRequests : mySubmissions;

  const handleActionClick = (req: ApprovalRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setActionType(type);
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
  };

  const getSopTitle = (sopId: string) => {
    const sop = sops.find(s => s.id === sopId);
    return sop ? sop.title : sopId;
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-monday-dark">Approvals</h1>
          <p className="text-sm text-gray-500">Manage review requests and track your submissions.</p>
        </div>

        <div className="bg-white border border-monday-border rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-monday-primary/10 text-monday-primary' : 'text-gray-500 hover:text-monday-dark'}`}
          >
            Queue ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('my-submissions')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'my-submissions' ? 'bg-monday-primary/10 text-monday-primary' : 'text-gray-500 hover:text-monday-dark'}`}
          >
            My Submissions ({mySubmissions.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-monday-border shadow-sm">
          <div className="text-2xl font-bold text-monday-dark mb-1">{incomingRequests.length}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-monday-yellow"></span> Pending Review</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-monday-border shadow-sm">
          <div className="text-2xl font-bold text-monday-dark mb-1">{mySubmissions.filter(r => r.status === 'APPROVED').length}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-monday-green"></span> Approved (My)</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-monday-border shadow-sm">
          <div className="text-2xl font-bold text-monday-dark mb-1">{mySubmissions.filter(r => r.status === 'REJECTED').length}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-monday-red"></span> Rejected (My)</div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {displayedRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-monday-border border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700">All caught up!</h3>
            <p className="text-gray-500 text-sm">No requests found in this view.</p>
          </div>
        ) : (
          displayedRequests.map(req => {
            const isEditRequest = req.type === 'EDIT';
            const title = getSopTitle(req.sopId);

            return (
              <div key={req.id} className="bg-white rounded-lg border border-monday-border p-4 hover:shadow-card transition-all group">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isEditRequest ? (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <LockOpen size={10} /> EDIT REQUEST
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          PUBLISH REQUEST
                        </span>
                      )}

                      {req.status === 'APPROVED' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">APPROVED</span>}
                      {req.status === 'REJECTED' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">REJECTED</span>}
                    </div>

                    <h3 className="font-bold text-lg text-monday-dark flex items-center gap-2">
                      <FileText size={18} className="text-gray-400" />
                      {title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">ID: {req.sopId}</p>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
                      <span className="flex items-center gap-1.5">
                        <img src={req.submittedBy?.avatar || ''} className="w-5 h-5 rounded-full" alt="" />
                        {req.submittedBy?.name || 'Unknown User'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <RoleBadge role={req.submittedBy?.role || UserRole.MEMBER} size="sm" />
                      <span className="text-gray-300">•</span>
                      <span>{req.submittedAt && !isNaN(new Date(req.submittedAt).getTime()) ? formatDistanceToNow(new Date(req.submittedAt)) + ' ago' : 'Recently'}</span>
                    </div>
                  </div>

                  {activeTab === 'pending' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onViewSOP(req.sopId)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium border border-gray-200 bg-white">View SOP</button>
                      <button onClick={() => handleActionClick(req, 'reject')} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium border border-red-200 bg-white">Reject</button>
                      <button onClick={() => handleActionClick(req, 'approve')} className="px-3 py-1.5 bg-monday-green text-white hover:bg-monday-greenHover rounded text-sm font-medium shadow-sm">Approve</button>
                    </div>
                  )}

                  {activeTab === 'my-submissions' && (
                    <button onClick={() => onViewSOP(req.sopId)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium border border-gray-200 bg-white">View SOP</button>
                  )}
                </div>

                {req.message && (
                  <div className="bg-monday-lightGray p-3 rounded-lg flex items-start gap-3">
                    <MessageSquare size={16} className="text-gray-400 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600 italic">"{req.message}"</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      {selectedRequest && actionType === 'approve' && (
        <ApproveDialog
          isOpen={true}
          onClose={closeDialog}
          sop={{ title: getSopTitle(selectedRequest.sopId) } as any}
          submitterName={selectedRequest.submittedBy.name}
          requestMessage={selectedRequest.message}
          isEditRequest={selectedRequest.type === 'EDIT'}
          onConfirm={(note) => { onApprove(selectedRequest.id, note); closeDialog(); }}
        />
      )}

      {selectedRequest && actionType === 'reject' && (
        <RejectDialog
          isOpen={true}
          onClose={closeDialog}
          sop={{ title: getSopTitle(selectedRequest.sopId) } as any}
          onConfirm={(reason) => { onReject(selectedRequest.id, reason); closeDialog(); }}
        />
      )}
    </div>
  );
};
