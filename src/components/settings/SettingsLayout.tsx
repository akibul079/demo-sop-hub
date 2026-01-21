import React, { useState } from 'react';
import { User, UserRole, UserStatus, UserInvite, UserActivityLog } from '../../types';
import {
    User as UserIcon,
    Bell,
    Users,
    Building,
    FileText,
    Shield,
    Zap,
    CreditCard,
    Menu,
    X
} from 'lucide-react';

import { ProfileSettings } from './ProfileSettings';
import { OrganizationSettings } from './OrganizationSettings';
import { SOPConfiguration } from './SOPConfiguration';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { IntegrationSettings } from './IntegrationSettings';
import { BillingSettings } from './BillingSettings';
import { UserManagement } from '../users/UserManagement';

interface SettingsLayoutProps {
    user: User;
    users?: User[];
    invites?: UserInvite[];
    activityLogs?: UserActivityLog[];
    onInvite?: (email: string, role: any, managerId?: string, message?: string) => void;
    onChangeRole?: (userId: string, newRole: any) => void;
    onDeactivate?: (userId: string) => void;
    onReactivate?: (userId: string) => void;
    onRevokeInvite?: (id: string) => void;
    onResendInvite?: (id: string) => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    user,
    users = [],
    invites = [],
    activityLogs = [],
    onInvite = () => { },
    onChangeRole = () => { },
    onDeactivate = () => { },
    onReactivate = () => { },
    onRevokeInvite = () => { },
    onResendInvite = () => { }
}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const isAdmin = isSuperAdmin || user.role === UserRole.ADMIN;
    const isManager = isAdmin || user.role === UserRole.MANAGER;

    const navItems = [
        { id: 'profile', label: 'My Profile', icon: UserIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        ...(isManager ? [{ id: 'users', label: 'Users & Teams', icon: Users }] : []),
        ...(isAdmin ? [{ id: 'organization', label: 'Organization', icon: Building }] : []),
        ...(isAdmin ? [{ id: 'sop-config', label: 'SOP Configuration', icon: FileText }] : []),
        { id: 'security', label: 'Security & Logs', icon: Shield },
        ...(isAdmin ? [{ id: 'integrations', label: 'Integrations', icon: Zap }] : []),
        ...(isSuperAdmin ? [{ id: 'billing', label: 'Billing & Plans', icon: CreditCard }] : [])
    ];

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'profile': return <ProfileSettings user={user} />;
                case 'notifications': return <NotificationSettings />;
                case 'users':
                    return isManager ? (
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
                case 'organization': return isAdmin ? <OrganizationSettings /> : <div className="p-4 text-gray-500">Access Restricted</div>;
                case 'sop-config': return isAdmin ? <SOPConfiguration /> : <div className="p-4 text-gray-500">Access Restricted</div>;
                case 'security': return <SecuritySettings />;
                case 'integrations': return isAdmin ? <IntegrationSettings /> : <div className="p-4 text-gray-500">Access Restricted</div>;
                case 'billing': return isSuperAdmin ? <BillingSettings /> : <div className="p-4 text-gray-500">Access Restricted</div>;
                default: return <div className="p-4 text-gray-500">Select a setting</div>;
            }
        } catch (e) {
            console.error("Error rendering settings tab content:", e);
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-bold mb-2">Error Loading Settings</h3>
                    <p className="text-sm text-red-600">There was a problem loading this section. Please try refreshing or checking the console.</p>
                </div>
            );
        }
    };

    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-lg text-monday-dark">Settings</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                        ? 'bg-blue-50 text-monday-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-monday-dark'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-gray-500">
                        <Menu size={20} />
                    </button>
                    <span className="font-medium text-gray-900">
                        {navItems.find(i => i.id === activeTab)?.label || 'Settings'}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
