
import React, { useState } from 'react';
import { X, ExternalLink, Clock, Calendar, Shield, Send, ClipboardCheck } from 'lucide-react';
import { SOP, SOPStatus } from '../types';

interface SOPQuickViewProps {
  sop: SOP;
  onClose: () => void;
  onOpenFull: () => void;
  onAddComment?: (sopId: string, text: string) => void;
  onStartChecklist?: (sop: SOP) => void;
}

const StatusBadge = ({ status }: { status: SOPStatus }) => {
  const colors = {
    [SOPStatus.DRAFT]: 'bg-gray-200 text-gray-700',
    [SOPStatus.PENDING_APPROVAL]: 'bg-monday-yellow text-white',
    [SOPStatus.APPROVED]: 'bg-monday-green text-white',
    [SOPStatus.PUBLISHED]: 'bg-monday-green text-white',
    [SOPStatus.REJECTED]: 'bg-monday-red text-white',
    [SOPStatus.ARCHIVED]: 'bg-monday-red text-white',
  };
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-medium ${colors[status] || colors[SOPStatus.DRAFT]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const SOPQuickView: React.FC<SOPQuickViewProps> = ({ sop, onClose, onOpenFull, onAddComment, onStartChecklist }) => {
  const [commentText, setCommentText] = useState('');

  const handleSendComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(sop.id, commentText);
      setCommentText('');
    }
  };

  const sortedComments = sop.comments && sop.comments.length > 0
    ? [...sop.comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const isPublished = sop.status === SOPStatus.PUBLISHED || sop.status === SOPStatus.APPROVED;

  return (
    <div className="w-full md:w-[480px] bg-white border-l border-monday-border h-full flex flex-col shadow-panel absolute right-0 top-0 bottom-0 z-40 animate-slideInRight">
      {/* Header */}
      <div className="h-16 border-b border-monday-border flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <StatusBadge status={sop.status} />
        </div>
        <div className="flex items-center gap-2">
          {isPublished && onStartChecklist && (
            <button
              onClick={() => onStartChecklist(sop)}
              className="px-4 py-2 bg-monday-green text-white hover:bg-monday-greenHover rounded-md flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"
            >
              <ClipboardCheck size={16} /> Start Checklist
            </button>
          )}
          <button
            onClick={onOpenFull}
            className="px-4 py-2 bg-[#111111] text-white hover:bg-gray-900 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <ExternalLink size={16} /> Open
          </button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-monday-dark hover:bg-monday-lightGray rounded transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Cover / Title Area */}
        <div className="p-8 pb-4 flex-1">
          <h2 className="text-2xl font-bold text-monday-dark mb-4 leading-tight">{sop.title}</h2>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{sop.estimatedTime || 15} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Updated {new Date(sop.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={14} />
              <span className="capitalize text-monday-primary">{sop.difficulty.toLowerCase()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-monday-lightGray rounded-lg border border-monday-border/50 mb-6">
            <div className="flex items-center gap-3">
              {sop.createdBy ? (
                <>
                  <img src={sop.createdBy.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Owner</p>
                    <p className="text-sm font-medium text-monday-dark">{sop.createdBy.name}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Owner</p>
                  <p className="text-sm font-medium text-monday-dark">Unknown</p>
                </div>
              )}
            </div>
            <button className="text-monday-primary text-sm font-medium hover:underline">Reassign</button>
          </div>

          <div className="mb-6">
            <h3 className="text-monday-dark font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {sop.shortDescription || "No description provided for this procedure."}
            </p>
          </div>

          {/* Steps Preview - Titles Only */}
          {sop.steps.length > 0 && (
            <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Steps Preview</h3>
              <div className="space-y-2">
                {sop.steps.slice(0, 3).map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-500 flex items-center justify-center shadow-sm shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate">{step.title}</span>
                  </div>
                ))}
                {sop.steps.length > 3 && (
                  <div className="pl-8 text-xs text-gray-400 italic">
                    + {sop.steps.length - 3} more steps
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments List inside Quick View */}
          <div className="mt-8 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-monday-dark mb-4">Comments ({sortedComments.length})</h3>
            <div className="space-y-4">
              {sortedComments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet.</p>
              ) : (
                sortedComments.map(comment => (
                  <div key={comment.id} className="flex gap-3 items-start">
                    <img src={comment.author.avatar} className="w-8 h-8 rounded-full border border-gray-100" alt="" />
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700">{comment.author.name}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer / Add Comment */}
        <div className="p-4 bg-gray-50 border-t border-monday-border mt-auto sticky bottom-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Write a comment..."
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-monday-primary focus:ring-2 focus:ring-monday-primary/10 shadow-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-monday-primary hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
