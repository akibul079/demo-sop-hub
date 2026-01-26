
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Folder } from '../types';
import { Check } from 'lucide-react';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folder: Partial<Folder>) => void;
  folders: Folder[];
  defaultParentId: string | null;
}

const FOLDER_COLORS = [
  { name: 'Blue', value: '#0073EA' },
  { name: 'Green', value: '#00C875' },
  { name: 'Yellow', value: '#FDAB3D' },
  { name: 'Red', value: '#E2445C' },
  { name: 'Purple', value: '#A25DDC' },
  { name: 'Pink', value: '#FF158A' },
  { name: 'Orange', value: '#FF642E' },
  { name: 'Cyan', value: '#66CCFF' },
  { name: 'Gray', value: '#676879' },
];

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  folders,
  defaultParentId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [color, setColor] = useState(FOLDER_COLORS[0].value);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setParentId(defaultParentId);
      setColor(FOLDER_COLORS[0].value);
    }
  }, [isOpen, defaultParentId]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onCreate({
      name,
      description,
      parentId,
      color,
      isOpen: true
    });
    onClose();
  };

  // Helper to build dropdown options with indentation
  const renderFolderOptions = (pid: string | null, depth = 0): React.ReactNode[] => {
    const children = folders.filter(f => f.parentId === pid);
    let options: React.ReactNode[] = [];
    
    children.forEach(child => {
      options.push(
        <option key={child.id} value={child.id}>
          {'\u00A0'.repeat(depth * 4)}{child.name}
        </option>
      );
      options = [...options, ...renderFolderOptions(child.id, depth + 1)];
    });
    
    return options;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultParentId ? "Create Subfolder" : "Create New Folder"}>
      <div className="space-y-5">
        
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#323338]">
            Folder Name <span className="text-[#E2445C]">*</span>
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2.5 bg-white border border-[#C5C7D0] rounded-lg text-[#323338] placeholder-[#C5C7D0] focus:outline-none focus:border-[#0073EA] focus:ring-4 focus:ring-[#0073EA]/10 transition-all text-sm"
            placeholder="e.g. Weekly Reports"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#323338]">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea 
            className="w-full px-3 py-2.5 bg-white border border-[#C5C7D0] rounded-lg text-[#323338] placeholder-[#C5C7D0] focus:outline-none focus:border-[#0073EA] focus:ring-4 focus:ring-[#0073EA]/10 transition-all text-sm resize-none"
            placeholder="What's in this folder?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Parent Folder */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#323338]">Parent Folder</label>
          <div className="relative">
             <select 
               className="w-full px-3 py-2.5 bg-white border border-[#C5C7D0] rounded-lg text-[#323338] focus:outline-none focus:border-[#0073EA] focus:ring-4 focus:ring-[#0073EA]/10 transition-all text-sm appearance-none cursor-pointer"
               value={parentId || ''}
               onChange={(e) => setParentId(e.target.value || null)}
             >
               <option value="">Root (No Parent)</option>
               {renderFolderOptions(null)}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#676879" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </div>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#323338]">Folder Color</label>
          <div className="flex flex-wrap gap-3">
             {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110
                    ${color === c.value ? 'ring-2 ring-offset-2 ring-[#323338] scale-110' : ''}
                  `}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && <Check size={14} className="text-white" />}
                </button>
             ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-[#323338] bg-white border border-[#C5C7D0] rounded-lg text-sm font-medium hover:bg-[#F6F7FB] transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={!name.trim()}
             className="px-4 py-2 bg-[#0073EA] text-white rounded-lg text-sm font-medium hover:bg-[#0060C7] disabled:opacity-50 transition-colors shadow-sm"
           >
             Create Folder
           </button>
        </div>

      </div>
    </Modal>
  );
};
