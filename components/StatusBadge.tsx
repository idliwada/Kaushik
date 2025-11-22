import React from 'react';
import { LeadStatus } from '../types';

const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const colors = {
    [LeadStatus.NEW]: 'bg-blue-100 text-blue-700 border-blue-200',
    [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [LeadStatus.NURTURING]: 'bg-purple-100 text-purple-700 border-purple-200',
    [LeadStatus.MEETING_BOOKED]: 'bg-orange-100 text-orange-700 border-orange-200',
    [LeadStatus.CLOSED]: 'bg-green-100 text-green-700 border-green-200',
    [LeadStatus.ARCHIVED]: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors[LeadStatus.NEW]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;