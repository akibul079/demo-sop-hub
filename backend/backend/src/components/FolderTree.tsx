
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder as FolderIcon, Plus, FolderPlus } from 'lucide-react';
import { Folder } from '../types';

interface FolderTreeProps {
  folders: Folder[]; // Flat list
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
  onCreateSubfolder: (parentId: string | null) => void;
}

interface TreeNodeProps {
  folder: Folder;
  level: number;
  allFolders: Folder[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateSubfolder: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  folder, 
  level, 
  allFolders, 
  selectedId, 
  onSelect,
  onCreateSubfolder
}) => {
  const [isExpanded, setIsExpanded] = useState(folder.isOpen !== false); // Default open unless explicitly closed
  const children = allFolders.filter(f => f.parentId === folder.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <div 
        className={`
          group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors relative
          ${isSelected ? 'bg-blue-50 text-monday-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-monday-dark'}
        `}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onSelect(folder.id)}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className={`p-0.5 rounded hover:bg-gray-200 ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        <FolderIcon 
          size={16} 
          className="shrink-0" 
          fill={isSelected ? 'currentColor' : folder.color} 
          stroke={isSelected ? 'currentColor' : folder.color}
          style={{ opacity: isSelected ? 1 : 0.8 }}
        />
        
        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>
        
        {folder.sopCount && folder.sopCount > 0 && (
           <span className="text-[10px] opacity-60">
             {folder.sopCount}
           </span>
        )}

        {/* Quick Add Subfolder Action */}
        <button
           onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
           className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
           title="Add Subfolder"
        >
           <Plus size={12} />
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
             <TreeNode 
               key={child.id} 
               folder={child} 
               level={level + 1} 
               allFolders={allFolders} 
               selectedId={selectedId} 
               onSelect={onSelect}
               onCreateSubfolder={onCreateSubfolder}
             />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  folders, 
  selectedFolderId, 
  onSelect, 
  onCreateSubfolder 
}) => {
  const roots = folders.filter(f => !f.parentId);

  return (
    <div className="py-2">
       <div className="flex items-center justify-between px-4 mb-2">
         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Folders</span>
         <button 
           onClick={() => onCreateSubfolder(null)}
           className="text-gray-400 hover:text-monday-primary transition-colors"
           title="Create Root Folder"
         >
           <FolderPlus size={14} />
         </button>
       </div>

       <div className="space-y-0.5 px-2">
         {roots.map(folder => (
            <TreeNode 
              key={folder.id} 
              folder={folder} 
              level={0} 
              allFolders={folders} 
              selectedId={selectedFolderId} 
              onSelect={onSelect}
              onCreateSubfolder={onCreateSubfolder}
            />
         ))}
       </div>

       {roots.length === 0 && (
          <div className="px-4 py-4 text-center">
             <p className="text-xs text-gray-500 mb-2">No folders yet</p>
             <button 
               onClick={() => onCreateSubfolder(null)}
               className="text-xs text-monday-primary hover:underline"
             >
               Create your first folder
             </button>
          </div>
       )}
    </div>
  );
};
