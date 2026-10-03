import React from 'react';
import type { PollStatus } from '../types/poll';
import { getStatusMeta } from '../utils/pollUtils';
import { Clock, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: PollStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border px-2.5 py-1 ${
        size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'
      } ${meta.badgeClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
      <span>{meta.label}</span>
      {status === 'active' && <Clock className="w-3.5 h-3.5 opacity-70" />}
      {status === 'scheduled' && <Clock className="w-3.5 h-3.5 opacity-70" />}
      {status === 'ended' && <AlertOctagon className="w-3.5 h-3.5 opacity-70" />}
    </span>
  );
};
