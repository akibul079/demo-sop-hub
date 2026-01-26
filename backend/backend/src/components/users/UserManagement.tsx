
import React, { useState, useMemo } from 'react';
import {
   Search, Download, UserPlus, Shield, CheckCircle2,
   AlertCircle, XCircle, MoreHorizontal, Mail, Clock, LayoutList,
   Trash2, RotateCw
} from 'lucide-react';
import { User, UserRole, UserStatus, UserInvite, InviteStatus, UserActivityLog } from '../../types';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { InviteUserDialog } from './InviteUserDialog';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { canManageUser, canDeactivateUser } from '../../lib/permissions';

interface UserManagementProps {
   currentUser: User;
   users: User[];
   invites: UserInvite[];
   activityLogs: UserActivityLog[];
   onInvite: (email: string, role: UserRole, managerId?: string, message?: string) => void;
   onChangeRole: (userId: string, newRole: UserRole) => void;
   onDeactivate: (userId: string) => void;
   onReactivate: (userId: string) => void;
   onRevokeInvite: (id: string) => void;
   onResendInvite: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
   currentUser,
   users,
   invites,
   activityLogs,
   onInvite,
   onChangeRole,
   onDeactivate,
   onReactivate,
   onRevokeInvite,
   onResendInvite
}) => {
   const [activeTab, setActiveTab] = useState<'USERS' | 'INVITES' | 'ACTIVITY'>('USERS');
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
   const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

   const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
   const [roleModalUser, setRoleModalUser] = useState<User | null>(null);

   // Stats
   const stats = useMemo(() => ({
      total: users.length,
      active: users.filter(u => u.status === UserStatus.ACTIVE).length,
      pending: invites.filter(i => i.status === InviteStatus.PENDING).length,
      deactivated: users.filter(u => u.status === UserStatus.DEACTIVATED || u.status === UserStatus.SUSPENDED).length
   }), [users, invites]);

   // Filtering Users
   const filteredUsers = users.filter(u => {
      const matchesSearch =
         u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
   });

   // Filtering Invites
   const filteredInvites = invites.filter(i =>
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.status.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const getManagerName = (managerId?: string | null) => {
      if (!managerId) return '—';
      const manager = users.find(u => u.id === managerId);
      return manager ? manager.name : 'Unknown';
   };

   return (
      <div className="space-y-6 animate-fadeIn h-full flex flex-col">

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div>
               <h2 className="text-2xl font-bold text-monday-dark">User Management</h2>
               <p className="text-gray-500 text-sm">Manage access, roles, and team structure.</p>
            </div>
            <button
               onClick={() => setIsInviteModalOpen(true)}
               className="bg-monday-primary text-white px-4 py-2.5 rounded-lg hover:bg-monday-primaryHover transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
               <UserPlus size={18} /> Invite User
            </button>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-xl border border-monday-border shadow-sm">
               <div className="text-2xl font-bold text-monday-dark mb-1">{stats.total}</div>
               <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Users</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-monday-border shadow-sm">
               <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
               <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-monday-border shadow-sm">
               <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
               <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending Invites</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-monday-border shadow-sm">
               <div className="text-2xl font-bold text-red-600 mb-1">{stats.deactivated}</div>
               <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive</div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex items-center gap-6 border-b border-gray-200 shrink-0">
            <button
               onClick={() => setActiveTab('USERS')}
               className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'USERS' ? 'border-monday-primary text-monday-primary' : 'border-transparent text-gray-500 hover:text-monday-dark'}`}
            >
               <LayoutList size={16} /> All Users
            </button>
            <button
               onClick={() => setActiveTab('INVITES')}
               className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'INVITES' ? 'border-monday-primary text-monday-primary' : 'border-transparent text-gray-500 hover:text-monday-dark'}`}
            >
               <Mail size={16} /> Invitations
               {invites.some(i => i.status === 'PENDING') && <span className="bg-monday-yellow text-xs px-1.5 rounded-full text-white">{invites.filter(i => i.status === 'PENDING').length}</span>}
            </button>
            <button
               onClick={() => setActiveTab('ACTIVITY')}
               className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ACTIVITY' ? 'border-monday-primary text-monday-primary' : 'border-transparent text-gray-500 hover:text-monday-dark'}`}
            >
               <Clock size={16} /> Activity Log
            </button>
         </div>

         {/* Content Area */}
         <div className="bg-white rounded-xl shadow-card border border-monday-border overflow-hidden flex-1 flex flex-col min-h-0">

            {/* Toolbar (Only for Users/Invites) */}
            {activeTab !== 'ACTIVITY' && (
               <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                  <div className="relative w-full md:w-96">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder={activeTab === 'USERS' ? "Search users..." : "Search invites..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-monday-primary transition-all"
                     />
                  </div>

                  {activeTab === 'USERS' && (
                     <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <select
                           value={roleFilter}
                           onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                           className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-monday-primary cursor-pointer"
                        >
                           <option value="ALL">All Roles</option>
                           <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                           <option value={UserRole.ADMIN}>Admin</option>
                           <option value={UserRole.MANAGER}>Manager</option>
                           <option value={UserRole.MEMBER}>Member</option>
                        </select>

                        <select
                           value={statusFilter}
                           onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                           className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-monday-primary cursor-pointer"
                        >
                           <option value="ALL">All Status</option>
                           <option value={UserStatus.ACTIVE}>Active</option>
                           <option value={UserStatus.PENDING}>Pending</option>
                           <option value={UserStatus.DEACTIVATED}>Deactivated</option>
                        </select>
                     </div>
                  )}
               </div>
            )}

            {/* Table Container */}
            <div className="overflow-auto custom-scrollbar flex-1">

               {/* USERS TABLE */}
               {activeTab === 'USERS' && (
                  <table className="w-full text-left border-collapse">
                     <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="bg-gray-50/50 border-b border-monday-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                           <th className="px-6 py-4">User</th>
                           <th className="px-6 py-4">Role</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Department</th>
                           <th className="px-6 py-4">Manager</th>
                           <th className="px-6 py-4">Last Active</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                           <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No users found matching your criteria.</td></tr>
                        ) : (
                           filteredUsers.map(u => (
                              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                                       <div>
                                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                          <p className="text-xs text-gray-500">{u.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <RoleBadge role={u.role} size="sm" />
                                 </td>
                                 <td className="px-6 py-4">
                                    <StatusBadge status={u.status} size="sm" />
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">{u.department || '—'}</td>
                                 <td className="px-6 py-4 text-sm text-gray-600">{getManagerName(u.managerId)}</td>
                                 <td className="px-6 py-4 text-sm text-gray-500">{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : 'Never'}</td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block text-left group/actions">
                                       <button className="text-gray-400 hover:text-monday-dark p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                          <MoreHorizontal size={18} />
                                       </button>
                                       <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 hidden group-hover/actions:block animate-fadeIn">
                                          <div className="py-1">
                                             <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <Mail size={14} /> Email User
                                             </button>
                                             {canManageUser(currentUser.role, u.role) && (
                                                <button onClick={() => setRoleModalUser(u)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                   <Shield size={14} /> Change Role
                                                </button>
                                             )}
                                             {canDeactivateUser(currentUser.role, u.role) && u.status !== UserStatus.DEACTIVATED && (
                                                <button onClick={() => onDeactivate(u.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                                                   <XCircle size={14} /> Deactivate
                                                </button>
                                             )}
                                             {canDeactivateUser(currentUser.role, u.role) && u.status === UserStatus.DEACTIVATED && (
                                                <button onClick={() => onReactivate(u.id)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-t border-gray-100">
                                                   <CheckCircle2 size={14} /> Reactivate
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               )}

               {/* INVITES TABLE */}
               {activeTab === 'INVITES' && (
                  <table className="w-full text-left border-collapse">
                     <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="bg-gray-50/50 border-b border-monday-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                           <th className="px-6 py-4">Email</th>
                           <th className="px-6 py-4">Role</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Invited By</th>
                           <th className="px-6 py-4">Sent At</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredInvites.length === 0 ? (
                           <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No invitations found.</td></tr>
                        ) : (
                           filteredInvites.map(invite => (
                              <tr key={invite.id} className="hover:bg-blue-50/30 transition-colors">
                                 <td className="px-6 py-4 text-sm font-medium text-gray-900">{invite.email}</td>
                                 <td className="px-6 py-4"><RoleBadge role={invite.role} size="sm" /></td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${invite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                          invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                             invite.status === 'REVOKED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                       }`}>{invite.status}</span>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">{users.find(u => u.id === invite.invitedBy)?.name || 'Unknown'}</td>
                                 <td className="px-6 py-4 text-sm text-gray-500">{new Date(invite.invitedAt).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {invite.status === 'PENDING' && (
                                       <>
                                          <button onClick={() => onResendInvite(invite.id)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-md" title="Resend Invite"><RotateCw size={16} /></button>
                                          <button onClick={() => onRevokeInvite(invite.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-md" title="Revoke Invite"><Trash2 size={16} /></button>
                                       </>
                                    )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               )}

               {/* ACTIVITY TABLE */}
               {activeTab === 'ACTIVITY' && (
                  <div className="divide-y divide-gray-100">
                     {activityLogs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No activity logs found.</div>
                     ) : (
                        activityLogs.map(log => (
                           <div key={log.id} className="px-6 py-4 hover:bg-gray-50 flex items-start gap-4">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-500 shrink-0">
                                 <Clock size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-gray-900">
                                    <span className="font-bold">{log.user?.name || 'Unknown User'}</span>
                                    <span className="font-normal text-gray-600"> {log.action.replace(/_/g, ' ').toLowerCase()} </span>
                                    <span className="font-bold">{log.entityType ? log.entityType.toLowerCase() : 'item'}</span>
                                 </p>
                                 {log.details && (
                                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 inline-block px-1 rounded">{JSON.stringify(log.details)}</p>
                                 )}
                                 <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               )}
            </div>
         </div>

         <InviteUserDialog
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            currentUser={currentUser}
            users={users}
            onInvite={onInvite}
         />

         <ChangeRoleDialog
            isOpen={!!roleModalUser}
            onClose={() => setRoleModalUser(null)}
            currentUser={currentUser}
            targetUser={roleModalUser}
            onConfirm={onChangeRole}
         />
      </div>
   );
};
