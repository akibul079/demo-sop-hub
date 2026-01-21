
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Send, Rocket, Save, Copy, RotateCcw } from 'lucide-react';
import { SOP, SOPStatus, User, UserRole } from '../types';
import { SubmitForApprovalDialog, PublishDirectlyDialog } from './approvals/ApprovalDialogs';
import { canPublishDirectly } from '../lib/permissions';

interface SOPActionButtonsProps {
  sop: SOP;
  currentUser: User;
  onSave: () => void;
  onSubmit: (sop: SOP, message: string) => void;
  onPublishDirectly: (sop: SOP, note: string) => void;
  onDuplicate: () => void;
}

export const SOPActionButtons: React.FC<SOPActionButtonsProps> = ({
  sop,
  currentUser,
  onSave,
  onSubmit,
  onPublishDirectly,
  onDuplicate
}) => {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDraft = sop.status === SOPStatus.DRAFT || sop.status === SOPStatus.REJECTED;
  const isPending = sop.status === SOPStatus.PENDING_APPROVAL;
  const canDirectPublish = canPublishDirectly(currentUser.role);

  // Draft Actions
  if (isDraft) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-4 py-2 text-monday-dark hover:bg-gray-100 rounded-lg font-bold text-sm flex items-center gap-2 border border-[#C5C7D0] transition-colors">
            <Save size={16} /> Save Draft
          </button>

          <div className="relative" ref={dropdownRef}>
            <div className="flex rounded-lg shadow-sm overflow-hidden">
                {/* Primary Action Button */}
                {canDirectPublish ? (
                  <button 
                    onClick={() => setShowPublishDialog(true)}
                    className="bg-monday-primary hover:bg-monday-primaryHover text-white px-4 py-2 font-bold text-sm flex items-center gap-2"
                  >
                    <Rocket size={16} /> Publish
                  </button>
                ) : (
                   <button 
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-monday-primary hover:bg-monday-primaryHover text-white px-4 py-2 font-bold text-sm flex items-center gap-2"
                  >
                    <Send size={16} /> Submit
                  </button>
                )}

                {/* Dropdown Toggle */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-monday-primaryHover text-white px-2 border-l border-white/20"
                >
                  <ChevronDown size={16} />
                </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-monday-border z-50 animate-fadeIn overflow-hidden">
                  {canDirectPublish && (
                    <button onClick={() => { setShowSubmitDialog(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100">
                      <Send size={16} className="text-gray-500" /> 
                      <div>
                        <span className="text-sm font-bold text-monday-dark block">Submit for Review</span>
                        <span className="text-[10px] text-gray-500 block">Get approval first</span>
                      </div>
                    </button>
                  )}
                  
                  <button onClick={() => { onDuplicate(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                    <Copy size={16} className="text-gray-500" /> <span className="text-sm font-medium text-gray-700">Duplicate SOP</span>
                  </button>
              </div>
            )}
          </div>
        </div>

        <SubmitForApprovalDialog isOpen={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} sop={sop} onConfirm={m => { onSubmit(sop, m); setShowSubmitDialog(false); }} />
        <PublishDirectlyDialog isOpen={showPublishDialog} onClose={() => setShowPublishDialog(false)} sop={sop} onConfirm={n => { onPublishDirectly(sop, n); setShowPublishDialog(false); }} />
      </>
    );
  }

  // Pending Approval Actions (Recall)
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
         {/* Recall logic requires checking if currentUser is submitter, simplified here for MVP */}
         <button 
            onClick={() => {
              // Should call a recall handler in real app. For MVP, we can reuse Save to revert to draft conceptually or add specific handler
              onSave(); 
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={16} /> Recall Submission
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1"
            >
              Actions <ChevronDown size={14} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-monday-border z-50 animate-fadeIn">
                  <button onClick={() => { onDuplicate(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                    <Copy size={16} className="text-gray-500" /> <span className="text-sm font-medium text-gray-700">Duplicate</span>
                  </button>
              </div>
            )}
          </div>
      </div>
    );
  }

  // Published/Approved Actions
  return (
    <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1"
        >
           Actions <ChevronDown size={14} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-monday-border z-50 animate-fadeIn">
              <button onClick={() => { onDuplicate(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                 <Copy size={16} className="text-gray-500" /> <span className="text-sm font-medium text-gray-700">Duplicate</span>
              </button>
          </div>
        )}
    </div>
  );
};
