import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import Kanban from './pages/Kanban';
import ContactDetail from './pages/ContactDetail';
import { Contact, Interaction, LeadStatus, InteractionType } from './types';

// Utility for generating IDs without external dependencies
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mock Data Initialization
const INITIAL_CONTACTS: Contact[] = [
  { 
    id: '1', firstName: 'Sarah', lastName: 'Miller', email: 'sarah.m@techcorp.com', title: 'VP of Sales', 
    status: LeadStatus.CONTACTED, tags: ['VIP', 'Decision Maker'], lastContacted: '2023-10-01', 
    followUpFrequencyDays: 30, companyId: 'TechCorp', linkedInUrl: 'https://linkedin.com', location: 'San Francisco, CA'
  },
  { 
    id: '2', firstName: 'David', lastName: 'Chen', email: 'dchen@startup.io', title: 'Founder', 
    status: LeadStatus.NURTURING, tags: ['Startup', 'High Potential'], lastContacted: '2023-09-15', 
    followUpFrequencyDays: 14, companyId: 'StartupIO', location: 'New York, NY'
  },
  { 
    id: '3', firstName: 'Jessica', lastName: 'Alba', email: 'jess@design.co', title: 'Creative Director', 
    status: LeadStatus.NEW, tags: ['Creative'], lastContacted: undefined, 
    followUpFrequencyDays: 60, companyId: 'DesignCo', location: 'Remote'
  },
  { 
    id: '4', firstName: 'Michael', lastName: 'Ross', email: 'mike@pearson.com', title: 'Attorney', 
    status: LeadStatus.MEETING_BOOKED, tags: ['Legal'], lastContacted: '2023-10-20', 
    followUpFrequencyDays: 90, location: 'Chicago, IL'
  },
];

const INITIAL_INTERACTIONS: Interaction[] = [
  { id: '101', contactId: '1', date: '2023-10-01', type: InteractionType.CALL, notes: 'Discussed Q4 roadmap. She is interested in the premium plan.' },
  { id: '102', contactId: '2', date: '2023-09-15', type: InteractionType.EMAIL, notes: 'Sent intro deck. Requested follow up in 2 weeks.' },
  { id: '103', contactId: '1', date: '2023-08-20', type: InteractionType.MEETING, notes: 'Lunch meeting at Blue Bottle. Personal connection established.' },
];

const App: React.FC = () => {
  // In a real app, these would be in a Context or Redux store
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [interactions, setInteractions] = useState<Interaction[]>(INITIAL_INTERACTIONS);

  // Load from local storage on mount (Simulated persistence)
  useEffect(() => {
    const savedContacts = localStorage.getItem('nexus_contacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {
        console.error("Failed to parse contacts from local storage");
      }
    }
    
    const savedInteractions = localStorage.getItem('nexus_interactions');
    if (savedInteractions) {
      try {
        setInteractions(JSON.parse(savedInteractions));
      } catch (e) {
        console.error("Failed to parse interactions from local storage");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('nexus_contacts', JSON.stringify(contacts));
    localStorage.setItem('nexus_interactions', JSON.stringify(interactions));
  }, [contacts, interactions]);

  const updateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const updateContactStatus = (id: string, status: LeadStatus) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const addInteraction = (newInteraction: Interaction) => {
    const interactionWithId = { ...newInteraction, id: newInteraction.id || generateId() };
    setInteractions(prev => [...prev, interactionWithId]);
    
    // Apollo Logic: Update "Last Contacted" on the contact automatically
    setContacts(prev => prev.map(c => {
        if (c.id === newInteraction.contactId) {
            // Check if this new interaction is more recent than current lastContacted
            const isNewer = !c.lastContacted || new Date(newInteraction.date) > new Date(c.lastContacted);
            if (isNewer) {
                return { ...c, lastContacted: newInteraction.date };
            }
        }
        return c;
    }));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard contacts={contacts} interactions={interactions} />} />
            <Route path="/contacts" element={<ContactList contacts={contacts} />} />
            <Route 
                path="/contacts/:id" 
                element={
                    <ContactDetail 
                        contacts={contacts} 
                        interactions={interactions} 
                        updateContact={updateContact}
                        addInteraction={addInteraction}
                    />
                } 
            />
            <Route path="/pipeline" element={<Kanban contacts={contacts} updateContactStatus={updateContactStatus} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;