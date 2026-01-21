
import { UserRole, UserStatus } from '../types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
};

export const ROLE_CONFIG: Record<UserRole, { 
  label: string; 
  description: string;
  color: string; 
  bgColor: string;
  canInvite: UserRole[];
  canManage: UserRole[];
}> = {
  SUPER_ADMIN: { 
    label: 'Super Admin', 
    description: 'Full platform control, billing, and all permissions',
    color: '#FF158A', 
    bgColor: '#FFE6F0',
    canInvite: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER],
    canManage: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER],
  },
  ADMIN: { 
    label: 'Admin', 
    description: 'Team management and user administration',
    color: '#A25DDC', 
    bgColor: '#F3E8FF',
    canInvite: [UserRole.MANAGER, UserRole.MEMBER],
    canManage: [UserRole.MANAGER, UserRole.MEMBER],
  },
  MANAGER: { 
    label: 'Manager', 
    description: 'Team lead with approval permissions',
    color: '#0073EA', 
    bgColor: '#E6F4FF',
    canInvite: [UserRole.MEMBER],
    canManage: [UserRole.MEMBER],
  },
  MEMBER: { 
    label: 'Member', 
    description: 'Standard user with basic permissions',
    color: '#676879', 
    bgColor: '#F6F7FB',
    canInvite: [],
    canManage: [],
  },
};

export const STATUS_CONFIG: Record<UserStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  ACTIVE: { label: 'Active', color: '#00C875', bgColor: '#E6F9F1' },
  PENDING: { label: 'Pending', color: '#FDAB3D', bgColor: '#FFF4E5' },
  DEACTIVATED: { label: 'Deactivated', color: '#E2445C', bgColor: '#FFEBEE' },
  SUSPENDED: { label: 'Suspended', color: '#676879', bgColor: '#F6F7FB' },
};

export function canApprove(approverRole: UserRole, submitterRole: UserRole): boolean {
  if (approverRole === UserRole.SUPER_ADMIN) return true;
  return ROLE_HIERARCHY[approverRole] > ROLE_HIERARCHY[submitterRole];
}

export function canPublishDirectly(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN;
}

export function canViewApprovalQueue(role: UserRole): boolean {
  return role !== UserRole.MEMBER;
}

export function canInviteRole(inviterRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_CONFIG[inviterRole].canInvite.includes(targetRole);
}

export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === UserRole.SUPER_ADMIN) return true;
  return ROLE_CONFIG[managerRole].canManage.includes(targetRole);
}

export function canDeactivateUser(currentUserRole: UserRole, targetRole: UserRole): boolean {
  if (currentUserRole === UserRole.SUPER_ADMIN) return true;
  if (currentUserRole === UserRole.ADMIN) {
    return [UserRole.MANAGER, UserRole.MEMBER].includes(targetRole);
  }
  return false;
}

export function getInvitableRoles(role: UserRole): UserRole[] {
  return ROLE_CONFIG[role].canInvite;
}
