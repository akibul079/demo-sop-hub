
import React, { useState } from 'react';
import {
   User, Bell, Monitor, Shield, Lock, CreditCard, Users,
   Building, Sliders, Webhook, FileText, ChevronRight,
   LogOut, Upload, Key, Eye, EyeOff, Save, Trash2,
   Mail, Search, MoreHorizontal, CheckCircle2, AlertCircle,
   Plus, Laptop, Smartphone
} from 'lucide-react';
import { User as UserType, UserRole, UserStatus } from '../types';
import { mockUsers } from '../mockData';
import { UserManagement } from './users/UserManagement';
import { useAuth } from '../lib/authContext';

// --- Sub Components ---

// 1. Profile Settings
const ProfileSettings = ({ user }: { user: UserType }) => {
   const { updateProfile } = useAuth();
   const [firstName, setFirstName] = useState(user.firstName);
   const [lastName, setLastName] = useState(user.lastName);
   const [jobTitle, setJobTitle] = useState(user.jobTitle || '');

   const handleSave = () => {
      updateProfile({ firstName, lastName, jobTitle, name: `${firstName} ${lastName}` });
      alert('Profile updated!');
   };

   return (
      <div className="space-y-8 animate-fadeIn">
         <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
            <h3 className="text-lg font-bold text-monday-dark mb-6">Profile Details</h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden relative group cursor-pointer">
                     <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={24} />
                     </div>
                  </div>
                  <button className="text-sm text-monday-primary font-medium hover:underline">Change Avatar</button>
               </div>

               <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">First Name</label>
                     <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Last Name</label>
                     <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Email Address</label>
                     <div className="relative">
                        <input type="email" value={user.email} disabled className="w-full px-3 py-2 border border-monday-border bg-gray-50 rounded-md text-gray-500" />
                        <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     </div>
                     <p className="text-xs text-gray-400">Contact support to change email.</p>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Job Role</label>
                     <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Bio / About</label>
                     <textarea rows={3} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary transition-colors" placeholder="Tell us a bit about yourself..."></textarea>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex justify-end gap-3">
            <button className="px-6 py-2 bg-monday-primary text-white rounded-md hover:bg-monday-primaryHover transition-colors font-medium shadow-sm flex items-center gap-2" onClick={handleSave}>
               <Save size={16} /> Save Changes
            </button>
         </div>
      </div>
   );
};

// Security Settings
const SecuritySettings = () => {
   const [twoFaEnabled, setTwoFaEnabled] = useState(false);

   return (
      <div className="space-y-8 animate-fadeIn">
         {/* Password */}
         <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
            <h3 className="text-lg font-bold text-monday-dark mb-6">Password</h3>
            <div className="flex justify-between items-center">
               <div>
                  <p className="text-sm text-gray-700 font-medium">Password</p>
                  <p className="text-xs text-gray-500">Last changed 3 months ago</p>
               </div>
               <button className="text-monday-primary text-sm font-bold border border-monday-primary px-4 py-2 rounded hover:bg-blue-50 transition-colors">Change Password</button>
            </div>
         </div>

         {/* 2FA */}
         <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
            <h3 className="text-lg font-bold text-monday-dark mb-4">Two-Factor Authentication</h3>
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
               <div>
                  <p className="text-sm font-medium text-gray-700">Authenticator App</p>
                  <p className="text-xs text-gray-500">Secure your account with 2FA.</p>
               </div>
               <button
                  onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${twoFaEnabled ? 'bg-red-50 text-red-600' : 'bg-monday-primary text-white'}`}
               >
                  {twoFaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
               </button>
            </div>
            {twoFaEnabled && (
               <div className="bg-green-50 p-4 mt-4 rounded-lg flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={16} /> Two-factor authentication is currently enabled.
               </div>
            )}
         </div>

         {/* Sessions */}
         <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
            <h3 className="text-lg font-bold text-monday-dark mb-6">Active Sessions</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                     <Laptop size={20} className="text-gray-500" />
                     <div>
                        <p className="text-sm font-bold text-monday-dark">Chrome on MacOS <span className="text-xs font-normal text-green-600 bg-green-100 px-1.5 rounded ml-2">Current</span></p>
                        <p className="text-xs text-gray-500">San Francisco, CA • Active now</p>
                     </div>
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                     <Smartphone size={20} className="text-gray-500" />
                     <div>
                        <p className="text-sm font-bold text-monday-dark">iPhone 15</p>
                        <p className="text-xs text-gray-500">San Francisco, CA • 2 hours ago</p>
                     </div>
                  </div>
                  <button className="text-xs text-red-500 hover:underline">Revoke</button>
               </div>
            </div>
            <button className="mt-4 text-sm text-red-600 font-bold hover:underline">Log Out All Other Devices</button>
         </div>
      </div>
   );
};

// 4. Workspace Settings (Super Admin Only)
const WorkspaceSettings = () => (
   <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
         <h3 className="text-lg font-bold text-monday-dark mb-6">Branding & Details</h3>

         <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Logo</label>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-monday-primary flex items-center justify-center text-white text-xl font-bold">SH</div>
                  <div className="space-y-2">
                     <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-monday-border rounded text-sm hover:bg-gray-50 transition-colors">Upload</button>
                        <button className="px-3 py-1.5 text-red-500 text-sm hover:bg-red-50 rounded transition-colors">Remove</button>
                     </div>
                     <p className="text-xs text-gray-400">Recommended size: 256x256px</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Workspace Name</label>
                  <input type="text" defaultValue="Acme Corporation" className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Industry</label>
                  <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white">
                     <option>Technology</option>
                     <option>Manufacturing</option>
                     <option>Retail</option>
                  </select>
               </div>
            </div>
         </div>
      </div>
   </div>
);

const CopyIcon = () => (
   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);

// --- Main Settings Layout ---

interface SettingsLayoutProps {
   user: UserType;
   users: UserType[];
   invites: any[];
   activityLogs: any[];
   onInvite: (email: string, role: UserRole, managerId?: string, message?: string) => void;
   onChangeRole: (userId: string, newRole: UserRole) => void;
   onDeactivate: (userId: string) => void;
   onReactivate: (userId: string) => void;
   onRevokeInvite: (id: string) => void;
   onResendInvite: (id: string) => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
   user, users, invites, activityLogs,
   onInvite, onChangeRole, onDeactivate, onReactivate,
   onRevokeInvite, onResendInvite
}) => {
   const { logout } = useAuth();
   const [activeTab, setActiveTab] = useState('profile');

   const canAccessUsers = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(user.role);
   const canAccessSuperAdmin = [UserRole.SUPER_ADMIN].includes(user.role);

   const tabs = [
      { id: 'profile', label: 'Profile', icon: User, group: 'General' },
      { id: 'security', label: 'Security', icon: Shield, group: 'General' },
      { id: 'notifications', label: 'Notifications', icon: Bell, group: 'General' },

      ...(canAccessUsers ? [
         { id: 'users', label: 'User Management', icon: Users, group: 'Admin' },
      ] : []),

      ...(canAccessSuperAdmin ? [
         { id: 'workspace', label: 'Workspace', icon: Building, group: 'Super Admin' },
      ] : [])
   ];

   const renderContent = () => {
      switch (activeTab) {
         case 'profile': return <ProfileSettings user={user} />;
         case 'security': return <SecuritySettings />;
         case 'users':
            return canAccessUsers ? (
               <UserManagement
                  currentUser={user}
                  users={users}
                  invites={invites}
                  activityLogs={activityLogs}
                  onInvite={onInvite}
                  onChangeRole={onChangeRole}
                  onDeactivate={onDeactivate}
                  onReactivate={onReactivate}
                  onRevokeInvite={onRevokeInvite}
                  onResendInvite={onResendInvite}
               />
            ) : null;
         case 'workspace': return canAccessSuperAdmin ? <WorkspaceSettings /> : null;
         default: return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Sliders size={48} className="mb-4 opacity-50" />
               <h3 className="text-lg font-medium">Coming Soon</h3>
            </div>
         );
      }
   };

   const groups = Array.from(new Set(tabs.map(t => t.group)));

   return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-monday-lightGray">
         {/* Settings Sidebar */}
         <aside className="w-full md:w-64 bg-white border-r border-monday-border flex-shrink-0 overflow-y-auto custom-scrollbar">
            <div className="p-6 pb-2">
               <h1 className="text-2xl font-bold text-monday-dark">Settings</h1>
               <p className="text-xs text-gray-500 mt-1">Manage your preferences</p>
            </div>

            <div className="p-4 space-y-6">
               {groups.map(group => (
                  <div key={group}>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{group}</h4>
                     <div className="space-y-0.5">
                        {tabs.filter(t => t.group === group).map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                           ${activeTab === tab.id
                                    ? 'bg-blue-50 text-monday-primary'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                         `}
                           >
                              <tab.icon size={18} />
                              {tab.label}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-auto p-6 border-t border-monday-border space-y-2">
               <button onClick={logout} className="w-full flex items-center gap-2 text-gray-600 hover:text-monday-dark text-sm font-medium transition-colors p-2 hover:bg-gray-100 rounded">
                  <LogOut size={16} /> Log Out
               </button>
               <button
                  onClick={() => { if (confirm('Delete account? This cannot be undone.')) logout(); }}
                  className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors p-2 hover:bg-red-50 rounded"
               >
                  <Trash2 size={16} /> Delete Account
               </button>
            </div>
         </aside>

         {/* Content Area */}
         <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
               <div className="md:hidden mb-6 flex items-center gap-2 text-gray-500">
                  <span>Settings</span> <ChevronRight size={14} /> <span className="text-monday-dark font-medium capitalize">{activeTab.replace('-', ' ')}</span>
               </div>
               {renderContent()}
            </div>
         </main>
      </div>
   );
};

export default SettingsLayout;
