
import React, { useState, useRef, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, FileText, FileDown, MoreHorizontal, Loader2, Image as ImageIcon, Copy, Edit, Trash2 } from 'lucide-react';
import { SOP, SOPStatus, PDFGenerationStatus } from '../types';

interface SOPCardProps {
  sop: SOP;
  onClick: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: (reason: string) => void;
}

const statusConfig = {
  [SOPStatus.DRAFT]: { label: 'Draft', bg: 'bg-gray-400', icon: FileText },
  [SOPStatus.PENDING_APPROVAL]: { label: 'In Review', bg: 'bg-monday-yellow', icon: AlertCircle },
  [SOPStatus.APPROVED]: { label: 'Approved', bg: 'bg-monday-green', icon: CheckCircle2 },
  [SOPStatus.PUBLISHED]: { label: 'Published', bg: 'bg-monday-primary', icon: CheckCircle2 },
  [SOPStatus.REJECTED]: { label: 'Rejected', bg: 'bg-monday-red', icon: AlertCircle },
  [SOPStatus.ARCHIVED]: { label: 'Stuck', bg: 'bg-monday-red', icon: FileText },
  [SOPStatus.DELETED]: { label: 'Deleted', bg: 'bg-red-600', icon: AlertCircle },
};

export const SOPCard: React.FC<SOPCardProps> = ({ sop, onClick, onEdit, onDuplicate, onDelete }) => {
  const status = statusConfig[sop.status] || statusConfig[SOPStatus.DRAFT];
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="group bg-white rounded-lg border border-monday-border hover:shadow-hover transition-all duration-300 cursor-pointer flex flex-col h-full relative"
      onClick={onClick}
    >
      {sop.coverImageUrl ? (
        <div className="h-32 w-full overflow-hidden shrink-0 border-b border-monday-border bg-gray-100 rounded-t-lg">
           <img src={sop.coverImageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
        </div>
      ) : (
        <div className="h-2 w-full shrink-0 rounded-t-lg" style={{ backgroundColor: status.bg.replace('bg-', '') }}></div>
      )}

      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2 relative">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            {sop.difficulty}
          </div>
          <div className="flex items-center gap-1">
            {sop.pdfStatus === PDFGenerationStatus.COMPLETED && <FileDown size={14} className="text-monday-primary" />}
            {sop.pdfStatus === PDFGenerationStatus.PROCESSING && <Loader2 size={14} className="text-monday-yellow animate-spin" />}
            
            <div className="relative" ref={menuRef}>
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                 className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-monday-dark"
               >
                 <MoreHorizontal size={16} />
               </button>
               
               {showMenu && (
                 <div 
                   className="absolute right-0 top-6 w-40 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 animate-fadeIn"
                   onClick={(e) => e.stopPropagation()}
                 >
                    <button onClick={() => { setShowMenu(false); onEdit(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => { setShowMenu(false); onDuplicate(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <Copy size={14} /> Duplicate
                    </button>
                    <div className="h-[1px] bg-gray-100 my-1"></div>
                    <button onClick={() => { setShowMenu(false); onDelete('Deleted from card'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <Trash2 size={14} /> Delete
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <h3 className="font-bold text-monday-dark text-sm mb-1 group-hover:text-monday-primary transition-colors line-clamp-1 leading-tight">
            {sop.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {sop.shortDescription || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
           <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white ${status.bg} shadow-sm`}>
              {status.label}
           </div>
           <div className="flex items-center gap-1.5">
             <span className="text-[9px] text-gray-400">
                {new Date(sop.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
             </span>
             <img src={sop.createdBy.avatar} alt="" className="w-6 h-6 rounded-full border border-white shadow-sm" />
           </div>
        </div>
      </div>
    </div>
  );
};
