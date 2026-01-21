
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, FileText, Folder as FolderIcon, Users, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';
import { SOP, SOPStatus, Folder, User } from '../types';

interface SOPBoardRowProps {
  sop: SOP;
  folders: Folder[];
  users: User[];
  onClick: () => void;
  onEditStatus?: (e: React.MouseEvent, status: SOPStatus) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: (reason: string) => void;
}

const statusConfig = {
  [SOPStatus.DRAFT]: { label: 'Draft', bg: 'bg-gray-400', text: 'text-white' },
  [SOPStatus.PENDING_APPROVAL]: { label: 'Pending', bg: 'bg-monday-yellow', text: 'text-white' },
  [SOPStatus.APPROVED]: { label: 'Approved', bg: 'bg-monday-green', text: 'text-white' },
  [SOPStatus.PUBLISHED]: { label: 'Published', bg: 'bg-monday-primary', text: 'text-white' },
  [SOPStatus.REJECTED]: { label: 'Rejected', bg: 'bg-monday-red', text: 'text-white' },
  [SOPStatus.ARCHIVED]: { label: 'Archived', bg: 'bg-gray-600', text: 'text-white' },
};

export const SOPBoardRow: React.FC<SOPBoardRowProps> = ({ sop, folders, users, onClick, onEdit, onDuplicate, onDelete }) => {
  const status = statusConfig[sop.status];
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Resolve relationships using passed props
  const assignedUsers = users.filter(u => sop.assignedUserIds.includes(u.id));
  const assignedFolders = folders.filter(f => sop.folderIds.includes(f.id));

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
      className="group grid grid-cols-12 gap-0 border-b border-monday-border hover:bg-monday-lightGray/50 transition-colors cursor-pointer text-sm h-10 relative"
      onClick={onClick}
    >
      {/* Selection & Title Column */}
      <div className="col-span-12 md:col-span-4 p-0 flex items-stretch border-r border-monday-border/50 relative">
         <div className="w-1.5 bg-monday-primary/0 group-hover:bg-monday-primary absolute left-0 top-0 bottom-0 transition-colors"></div>
         <div className="flex items-center gap-3 p-2 w-full pl-4">
           <input type="checkbox" className="rounded border-gray-300 text-monday-primary focus:ring-monday-primary cursor-pointer" onClick={e => e.stopPropagation()} />
           <FileText size={16} className="text-gray-400 shrink-0" />
           <span className="font-medium text-monday-dark truncate">{sop.title}</span>
         </div>
      </div>

      {/* Status Column */}
      <div className="col-span-6 md:col-span-2 p-1 border-r border-monday-border/50">
        <div 
          className={`w-full h-full flex items-center justify-center text-xs font-medium text-white shadow-sm transition-opacity relative group/status ${status.bg} rounded-full`}
        >
           {status.label}
        </div>
      </div>

      {/* Folders Column */}
      <div className="col-span-3 md:col-span-2 hidden md:flex items-center border-r border-monday-border/50 px-3 overflow-hidden">
         <div className="flex gap-1 flex-wrap h-6 overflow-hidden">
            {assignedFolders.length > 0 ? assignedFolders.map(f => (
               <span key={f.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200 truncate max-w-[80px]">
                  <FolderIcon size={10} className="mr-1" /> {f.name}
               </span>
            )) : <span className="text-gray-300 text-xs">-</span>}
         </div>
      </div>

      {/* People Column */}
      <div className="col-span-2 hidden md:flex items-center justify-center border-r border-monday-border/50 p-1">
         <div className="flex -space-x-2 overflow-hidden pl-2">
            {assignedUsers.length > 0 ? assignedUsers.map((u, i) => (
                <img 
                  key={u.id}
                  src={u.avatar} 
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white" 
                  alt={u.name}
                  title={u.name}
                />
            )) : <span className="text-gray-300 text-xs">-</span>}
         </div>
      </div>

      {/* Date Column */}
      <div className="col-span-3 md:col-span-2 hidden md:flex items-center justify-center p-2 text-gray-500 font-body text-xs relative">
         {new Date(sop.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
         
         <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
            >
               <MoreHorizontal size={16} />
            </button>
            {showMenu && (
                 <div 
                   className="absolute right-0 top-8 w-40 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 animate-fadeIn"
                   onClick={(e) => e.stopPropagation()}
                 >
                    <button onClick={() => { setShowMenu(false); onEdit(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => { setShowMenu(false); onDuplicate(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <Copy size={14} /> Duplicate
                    </button>
                    <div className="h-[1px] bg-gray-100 my-1"></div>
                    <button onClick={() => { setShowMenu(false); onDelete('Deleted from board'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <Trash2 size={14} /> Delete
                    </button>
                 </div>
               )}
         </div>
      </div>
    </div>
  );
};
