
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UserRole, User } from '../../types';
import { ROLE_CONFIG, canManageUser } from '../../lib/permissions';
import { AlertTriangle, Check } from 'lucide-react';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: User | null;
  onConfirm: (userId: string, newRole: UserRole) => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  onConfirm
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.MEMBER);

  // Update internal state when targetUser changes. 
  // IMPORTANT: Hooks must be called unconditionally before any early return.
  React.useEffect(() => {
    if (targetUser) setSelectedRole(targetUser.role);
  }, [targetUser]);

  if (!targetUser) return null;

  const handleSubmit = () => {
    onConfirm(targetUser.id, selectedRole);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change User Role">
      <div className="space-y-6">
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
           <img src={targetUser.avatar} className="w-10 h-10 rounded-full" alt="" />
           <div>
              <p className="font-bold text-gray-900 text-sm">{targetUser.name}</p>
              <p className="text-xs text-gray-500">{targetUser.email}</p>
           </div>
        </div>

        <div className="space-y-3">
           <label className="block text-sm font-bold text-gray-700">New Role</label>
           
           <div className="space-y-2">
              {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                 const role = roleKey as UserRole;
                 const canSet = canManageUser(currentUser.role, role);
                 const isSelected = selectedRole === role;

                 return (
                    <label 
                      key={role}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected ? 'border-monday-primary bg-blue-50 ring-1 ring-monday-primary' : 'border-gray-200 hover:border-gray-300 bg-white'}
                        ${!canSet ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                      `}
                    >
                       <div className="mt-0.5 relative">
                          <input 
                            type="radio" 
                            name="role" 
                            value={role}
                            checked={isSelected}
                            disabled={!canSet}
                            onChange={() => setSelectedRole(role)}
                            className="sr-only" 
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-monday-primary' : 'border-gray-400'}`}>
                             {isSelected && <div className="w-2 h-2 rounded-full bg-monday-primary"></div>}
                          </div>
                       </div>
                       
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                             <span className={`text-sm font-bold ${isSelected ? 'text-monday-primary' : 'text-gray-900'}`}>{config.label}</span>
                             {!canSet && <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Restricted</span>}
                          </div>
                          <p className="text-xs text-gray-500">{config.description}</p>
                       </div>
                    </label>
                 );
              })}
           </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-xs border border-yellow-100">
           <AlertTriangle size={16} className="shrink-0 mt-0.5" />
           <p>Changing a user's role will immediately affect their permissions and access to features within the workspace.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             className="px-4 py-2 bg-monday-primary text-white rounded-lg text-sm font-medium hover:bg-monday-primaryHover transition-colors shadow-sm flex items-center gap-2"
           >
             Change Role
           </button>
        </div>

      </div>
    </Modal>
  );
};
