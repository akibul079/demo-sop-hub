
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UserRole, User } from '../../types';
import { ROLE_CONFIG, getInvitableRoles } from '../../lib/permissions';
import { Send, User as UserIcon, Mail, Shield } from 'lucide-react';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[]; // For manager selection
  onInvite: (email: string, role: UserRole, managerId?: string, message?: string) => void;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [managerId, setManagerId] = useState<string>('');
  const [message, setMessage] = useState('');

  const invitableRoles = getInvitableRoles(currentUser.role);
  
  const potentialManagers = users.filter(u => 
    u.status === 'ACTIVE' && 
    (u.role === UserRole.SUPER_ADMIN || u.role === UserRole.ADMIN || u.role === UserRole.MANAGER)
  );

  const handleSubmit = () => {
    if (!email) return;
    onInvite(email, role, managerId || undefined, message);
    onClose();
    // Reset form
    setEmail('');
    setRole(UserRole.MEMBER);
    setManagerId('');
    setMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite User">
      <div className="space-y-5">
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
          <div className="relative">
             <input 
               type="email" 
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
               placeholder="newuser@company.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               autoFocus
             />
             <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
          <div className="relative">
             <select 
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm appearance-none cursor-pointer"
               value={role}
               onChange={(e) => setRole(e.target.value as UserRole)}
             >
               {invitableRoles.map(r => (
                 <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
               ))}
             </select>
             <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#676879" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </div>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{ROLE_CONFIG[role].description}</p>
        </div>

        {/* Manager */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Manager <span className="text-gray-400 font-normal">(Optional)</span></label>
          <div className="relative">
             <select 
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm appearance-none cursor-pointer"
               value={managerId}
               onChange={(e) => setManagerId(e.target.value)}
             >
               <option value="">No manager</option>
               {potentialManagers.map(u => (
                 <option key={u.id} value={u.id}>{u.name} ({ROLE_CONFIG[u.role].label})</option>
               ))}
             </select>
             <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#676879" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal Message <span className="text-gray-400 font-normal">(Optional)</span></label>
          <textarea 
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm resize-none"
            placeholder="Welcome to the team!"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
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
             disabled={!email}
             className="px-4 py-2 bg-monday-primary text-white rounded-lg text-sm font-medium hover:bg-monday-primaryHover disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
           >
             <Send size={14} /> Send Invite
           </button>
        </div>

      </div>
    </Modal>
  );
};
