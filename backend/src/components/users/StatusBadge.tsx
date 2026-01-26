
import React from 'react';
import { UserStatus } from '../../types';
import { STATUS_CONFIG } from '../../lib/permissions';

interface StatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
      {config.label}
    </span>
  );
};
