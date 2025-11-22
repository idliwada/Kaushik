import React, { useMemo } from 'react';
import { Contact, Interaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Calendar, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  contacts: Contact[];
  interactions: Interaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ contacts, interactions }) => {
  
  // Apollo Logic: "Next Follow-up Due"
  const dueContacts = useMemo(() => {
    const today = new Date();
    return contacts.filter(c => {
      if (!c.lastContacted) return true; // Never contacted, so due
      const lastDate = new Date(c.lastContacted);
      const nextDueDate = new Date(lastDate);
      nextDueDate.setDate(lastDate.getDate() + c.followUpFrequencyDays);
      return nextDueDate <= today && c.status !== 'Archived' && c.status !== 'Closed';
    }).sort((a, b) => {
      // Priority: Never contacted first, then by days overdue
      if (!a.lastContacted) return -1;
      if (!b.lastContacted) return 1;
      return new Date(a.lastContacted).getTime() - new Date(b.lastContacted).getTime();
    });
  }, [contacts]);

  // Mock Data for Chart
  const chartData = [
    { name: 'Mon', calls: 4, emails: 2 },
    { name: 'Tue', calls: 3, emails: 8 },
    { name: 'Wed', calls: 2, emails: 5 },
    { name: 'Thu', calls: 6, emails: 3 },
    { name: 'Fri', calls: 1, emails: 9 },
    { name: 'Sat', calls: 0, emails: 1 },
    { name: 'Sun', calls: 0, emails: 0 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here is your relationship health overview.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Due Today</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{dueContacts.length}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Contacts</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{contacts.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Across all pipelines</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Interactions (30d)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{interactions.length}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </div>
           <p className="text-xs text-slate-400 mt-2">+12% vs last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-500">Pipeline Value</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">$42,500</h3>
            </div>
           <p className="text-xs text-slate-400 mt-2">Estimated potential</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Action List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-800">Up Next: Recommended Follow-ups</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">Sorted by Urgency</span>
          </div>
          <div className="divide-y divide-slate-100">
            {dueContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    No follow-ups due today! Good job.
                </div>
            ) : dueContacts.slice(0, 5).map(contact => (
              <div key={contact.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{contact.firstName} {contact.lastName}</h4>
                    <p className="text-sm text-slate-500">{contact.title || 'No Title'} • {contact.companyId ? 'Tech Corp' : 'Freelance'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-red-500">Overdue</p>
                        <p className="text-xs text-slate-400">Last: {contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : 'Never'}</p>
                   </div>
                   <Link to={`/contacts/${contact.id}`} className="p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link to="/contacts" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all contacts</Link>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-lg text-slate-800 mb-6">Activity Volume</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="calls" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="emails" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;