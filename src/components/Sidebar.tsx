
import React from 'react';
import {
  LayoutGrid,
  Layers,
  FileText,
  Activity,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Briefcase,
  Home,
  CheckSquare,
  Trash2,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import { Folder as FolderType, UserRole, User } from '../types';
import { FolderTree } from './FolderTree';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  folders: FolderType[];
  activeFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  activePath: string;
  onNavigate: (path: string) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: User;
  approvalCount?: number;
}

const NavItem = ({
  icon: Icon,
  children,
  active,
  collapsed,
  onClick,
  variant = 'default',
  badge
}: {
  icon: React.ElementType,
  children?: React.ReactNode,
  active?: boolean,
  collapsed: boolean,
  onClick?: () => void,
  variant?: 'default' | 'danger',
  badge?: number
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-lg transition-all duration-200 text-[15px] font-normal relative
      ${active
        ? variant === 'danger' ? 'bg-red-50 text-red-600 font-medium' : 'bg-blue-50 text-monday-primary font-medium'
        : 'text-gray-600 hover:bg-monday-lightGray hover:text-monday-dark'}
      ${collapsed ? 'justify-center px-2 mx-0' : ''}
    `}
    title={collapsed ? (children as string) : ''}
  >
    <div className="relative">
      <Icon size={20} className={active ? '' : 'text-gray-500'} strokeWidth={1.5} />
      {collapsed && badge && badge > 0 ? (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
      ) : null}
    </div>

    {!collapsed && (
      <div className="flex-1 flex items-center justify-between">
        <span>{children}</span>
        {badge && badge > 0 ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </div>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  folders,
  activeFolderId,
  onSelectFolder,
  activePath,
  onNavigate,
  onCreateFolder,
  onDeleteFolder,
  mobileOpen,
  onCloseMobile,
  currentUser,
  approvalCount = 0
}) => {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-monday-dark/50 z-40 md:hidden animate-fadeIn backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-monday-border flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          transform md:translate-x-0 md:static md:inset-auto md:h-full
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
          w-[280px] shadow-lg md:shadow-none
        `}
      >
        <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-monday-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center md:w-full' : ''}`}>
            <div className="w-9 h-9 rounded-md bg-monday-primary flex items-center justify-center shrink-0 shadow-sm text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Layers size={20} strokeWidth={2.5} />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-xl text-monday-dark tracking-tight leading-none">SOP Hub</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">ENTERPRISE</span>
              </div>
            )}
          </div>
          <button onClick={onCloseMobile} className="md:hidden text-gray-500 hover:text-monday-dark p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar">
          <div className="mb-4 space-y-0.5 px-2">
            <NavItem
              icon={Home}
              active={activePath === 'dashboard'}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
            >
              Dashboard
            </NavItem>

            <NavItem
              icon={ClipboardCheck}
              active={activePath.startsWith('checklist')}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { onNavigate('checklists'); onCloseMobile(); }}
            >
              Checklists
            </NavItem>

            <NavItem
              icon={Clock}
              active={activePath === 'waiting-for-approval'}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { onSelectFolder(null); onNavigate('waiting-for-approval'); onCloseMobile(); }}
            >
              Waiting for Approval
            </NavItem>

            {currentUser.role !== UserRole.MEMBER && (
              <NavItem
                icon={CheckSquare}
                active={activePath === 'approvals'}
                collapsed={collapsed && !mobileOpen}
                onClick={() => { onNavigate('approvals'); onCloseMobile(); }}
                badge={approvalCount}
              >
                Approvals
              </NavItem>
            )}

            <NavItem
              icon={LayoutGrid}
              active={activePath === 'library' && !activeFolderId}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { onSelectFolder(null); onNavigate('library'); onCloseMobile(); }}
            >
              All SOPs
            </NavItem>

            <NavItem
              icon={Trash2}
              active={activePath === 'trash'}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { onNavigate('trash'); onCloseMobile(); }}
              variant="danger"
            >
              Trash
            </NavItem>
          </div>

          <div className="mx-4 my-2 border-t border-monday-border"></div>

          {(!collapsed || mobileOpen) && (
            <FolderTree
              folders={folders}
              selectedFolderId={activeFolderId}
              onSelect={(id) => { onSelectFolder(id); onNavigate('library'); onCloseMobile(); }}
              onCreateSubfolder={onCreateFolder}
            />
          )}
        </nav>

        <div className="p-3 border-t border-monday-border shrink-0 bg-gray-50">
          <div className="px-2">
            <NavItem collapsed={collapsed && !mobileOpen} icon={Settings} active={activePath === 'settings'} onClick={() => { onNavigate('settings'); onCloseMobile(); }}>Settings</NavItem>
          </div>
          <div className={`mt-2 hidden md:flex items-center ${collapsed ? 'justify-center' : 'justify-end px-4'}`}>
            <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-monday-border text-gray-400 hover:text-monday-dark hover:bg-gray-100 transition-all shadow-sm">
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
