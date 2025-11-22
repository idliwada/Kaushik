import React from 'react';
import { Contact, LeadStatus } from '../types';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Plus } from 'lucide-react';

interface KanbanProps {
  contacts: Contact[];
  updateContactStatus: (id: string, status: LeadStatus) => void;
}

const COLUMNS = [
  { id: LeadStatus.NEW, title: 'New Lead', color: 'bg-blue-500' },
  { id: LeadStatus.CONTACTED, title: 'Contacted', color: 'bg-yellow-500' },
  { id: LeadStatus.NURTURING, title: 'Nurturing', color: 'bg-purple-500' },
  { id: LeadStatus.MEETING_BOOKED, title: 'Meeting Booked', color: 'bg-orange-500' },
  { id: LeadStatus.CLOSED, title: 'Closed', color: 'bg-green-500' },
];

const Kanban: React.FC<KanbanProps> = ({ contacts, updateContactStatus }) => {
  
  const getContactsByStatus = (status: LeadStatus) => {
    return contacts.filter(c => c.status === status);
  };

  return (
    <div className="p-6 h-screen overflow-hidden flex flex-col">
      <header className="flex justify-between items-center mb-6 px-2">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            <p className="text-slate-500">Drag and drop contacts to update their journey (simulated).</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Deal
        </button>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 min-w-[1200px] pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-slate-50 rounded-xl border border-slate-200 max-h-full">
              
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-slate-200 bg-white rounded-t-xl">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                   <h3 className="font-semibold text-slate-700 text-sm">{col.title}</h3>
                   <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                       {getContactsByStatus(col.id as LeadStatus).length}
                   </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              {/* Cards Container */}
              <div className="p-2 flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                {getContactsByStatus(col.id as LeadStatus).map(contact => (
                  <div key={contact.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group relative">
                    <Link to={`/contacts/${contact.id}`} className="block">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wide">
                                {contact.companyId ? 'Tech Corp' : 'Lead'}
                            </span>
                            {contact.lastContacted && (
                                <span className="text-[10px] text-slate-400">
                                    {new Date(contact.lastContacted).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </span>
                            )}
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm">{contact.firstName} {contact.lastName}</h4>
                        <p className="text-xs text-slate-500 mb-3">{contact.title || 'No Title'}</p>
                        
                        <div className="flex items-center gap-2">
                            {contact.tags.slice(0,2).map(tag => (
                                <span key={tag} className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </Link>
                    
                    {/* Quick Move Actions (Simulating Drag & Drop) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <select 
                          value={contact.status}
                          onChange={(e) => updateContactStatus(contact.id, e.target.value as LeadStatus)}
                          className="text-[10px] border border-slate-300 rounded bg-white p-1 shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                           {Object.values(LeadStatus).map(s => (
                               <option key={s} value={s}>{s}</option>
                           ))}
                       </select>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="m-2 p-2 text-slate-500 text-sm hover:bg-slate-200 rounded-lg border border-dashed border-slate-300 flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> New
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kanban;