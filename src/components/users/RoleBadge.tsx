
import React from 'react';
import { Crown, Shield, Users, User } from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_CONFIG } from '../../lib/permissions';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const ICONS = {
  SUPER_ADMIN: Crown,
  ADMIN: Shield,
  MANAGER: Users,
  MEMBER: User,
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true, size = 'md' }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;
  const Icon = ICONS[role] || User;
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />}
      {config.label}
    </span>
  );
};
