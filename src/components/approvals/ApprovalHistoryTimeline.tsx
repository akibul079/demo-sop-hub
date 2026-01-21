
import React from 'react';
import { ApprovalAction, ApprovalHistory } from '../../types';
import { RoleBadge } from '../users/RoleBadge';

const ACTION_CONFIG: Record<ApprovalAction, { label: string; color: string; bgColor: string }> = {
  SUBMITTED: { label: 'Submitted for Approval', color: '#FDAB3D', bgColor: '#FFF4E5' },
  APPROVED: { label: 'Approved', color: '#00C875', bgColor: '#E6F9F1' },
  REJECTED: { label: 'Rejected', color: '#E2445C', bgColor: '#FFEBEE' },
  PUBLISHED: { label: 'Published', color: '#0073EA', bgColor: '#E6F4FF' },
  REVISION_REQUESTED: { label: 'Revision Requested', color: '#FDAB3D', bgColor: '#FFF4E5' },
  EDIT_REQUESTED: { label: 'Edit Requested', color: '#0073EA', bgColor: '#E6F4FF' },
  EDIT_APPROVED: { label: 'Edit Approved', color: '#00C875', bgColor: '#E6F9F1' },
};

interface ApprovalHistoryTimelineProps {
  history: ApprovalHistory[];
}

export const ApprovalHistoryTimeline: React.FC<ApprovalHistoryTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-xs italic">
        No approval history available.
      </div>
    );
  }

  // Sort newest first
  const sortedHistory = [...history].sort((a, b) => new Date(b.actionAt).getTime() - new Date(a.actionAt).getTime());
  
  return (
    <div className="space-y-0 pl-2">
      {sortedHistory.map((item, index) => {
        const config = ACTION_CONFIG[item.action];
        const isLast = index === sortedHistory.length - 1;
        
        return (
          <div key={item.id} className="flex gap-3">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full border-2 shrink-0 z-10"
                style={{ 
                  borderColor: config.color,
                  backgroundColor: config.bgColor,
                }}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 my-1" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <img src={item.actionBy.avatar} className="w-5 h-5 rounded-full border border-gray-100" alt="" />
                <span className="text-xs font-medium text-gray-700">{item.actionBy.name}</span>
                <RoleBadge role={item.actionBy.role} size="sm" showIcon={false} />
              </div>
              
              <div className="text-[10px] text-gray-400 mb-2">
                {new Date(item.actionAt).toLocaleDateString()} at {new Date(item.actionAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              
              {item.note && (
                <div className="p-2 bg-gray-50 rounded border border-gray-100 text-xs text-gray-600 italic">
                  "{item.note}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
