import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Contact, Interaction, InteractionType, LeadStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { enrichContactData, generateEngagementSuggestion } from '../services/geminiService';
import { 
    ArrowLeft, Mail, Phone, Calendar, MapPin, Briefcase, Linkedin, 
    Clock, Sparkles, Plus, Send, AlertCircle, MessageSquare 
} from 'lucide-react';

interface ContactDetailProps {
    contacts: Contact[];
    interactions: Interaction[];
    updateContact: (contact: Contact) => void;
    addInteraction: (interaction: Interaction) => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contacts, interactions, updateContact, addInteraction }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [contact, setContact] = useState<Contact | undefined>(contacts.find(c => c.id === id));
    const [contactInteractions, setContactInteractions] = useState<Interaction[]>([]);
    
    // Interaction Logging State
    const [newNote, setNewNote] = useState("");
    const [interactionType, setInteractionType] = useState<InteractionType>(InteractionType.CALL);

    // AI States
    const [enriching, setEnriching] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [suggestion, setSuggestion] = useState<{healthScore: number; suggestion: string; emailDraft: string} | null>(null);
    const [rawEnrichText, setRawEnrichText] = useState("");
    const [showEnrichModal, setShowEnrichModal] = useState(false);

    useEffect(() => {
        if (contacts && id) {
            setContact(contacts.find(c => c.id === id));
            setContactInteractions(interactions.filter(i => i.contactId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [contacts, interactions, id]);

    if (!contact) return <div className="p-8 text-center">Contact not found</div>;

    const handleEnrichment = async () => {
        if(!rawEnrichText) return;
        setEnriching(true);
        try {
            const newData = await enrichContactData(rawEnrichText);
            const updated = { ...contact, ...newData };
            setContact(updated);
            updateContact(updated);
            setShowEnrichModal(false);
            setRawEnrichText("");
        } catch (e) {
            console.error(e);
            alert("Failed to enrich data using Gemini.");
        } finally {
            setEnriching(false);
        }
    };

    const handleSuggestion = async () => {
        setSuggesting(true);
        try {
            const result = await generateEngagementSuggestion(contact, contactInteractions);
            setSuggestion(result);
        } catch (e) {
            console.error(e);
            alert("Failed to generate suggestion.");
        } finally {
            setSuggesting(false);
        }
    };

    const handleSaveInteraction = () => {
        if (!newNote.trim()) return;

        const interaction: Interaction = {
            id: Math.random().toString(36).substr(2, 9),
            contactId: contact.id,
            date: new Date().toISOString(),
            type: interactionType,
            notes: newNote
        };

        addInteraction(interaction);
        setNewNote("");
        // Optimistically update local state
        setContactInteractions(prev => [interaction, ...prev]);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-sm">
                            {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{contact.firstName} {contact.lastName}</h1>
                                <StatusBadge status={contact.status} />
                            </div>
                            <p className="text-lg text-slate-600 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                {contact.title || 'No Title'} @ {contact.companyId ? 'Tech Corp' : 'Unknown Company'}
                            </p>
                            <div className="flex gap-4 mt-3 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {contact.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-slate-400" /> Last: {contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowEnrichModal(true)}
                            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4 text-purple-500" /> Enrich
                        </button>
                        <button 
                            onClick={() => document.getElementById('log-activity-input')?.focus()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                        >
                            Log Activity
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info & AI Actions */}
                <div className="space-y-6">
                     {/* Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                                    <p className="text-sm text-slate-900 truncate">{contact.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                                    <p className="text-sm text-slate-900">{contact.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Linkedin className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Social</p>
                                    <a href={contact.linkedInUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline truncate block">LinkedIn Profile</a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {contact.tags.map(t => (
                                    <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{t}</span>
                                ))}
                                <button className="px-2 py-1 border border-dashed border-slate-300 text-slate-400 rounded text-xs hover:text-indigo-600 hover:border-indigo-300 transition-colors">+ Add</button>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" /> Apollo Assistant
                            </h3>
                            {!suggestion && (
                                <button onClick={handleSuggestion} disabled={suggesting} className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full shadow-sm font-medium hover:bg-indigo-50 disabled:opacity-50">
                                    {suggesting ? 'Thinking...' : 'Get Suggestions'}
                                </button>
                            )}
                        </div>
                        
                        {!suggestion ? (
                            <p className="text-sm text-indigo-800/70">
                                Use AI to analyze interaction history and suggest the perfect follow-up email and timing.
                            </p>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Relationship Health</span>
                                        <span className="text-sm font-bold text-green-600">{suggestion.healthScore}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${suggestion.healthScore}%`}}></div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-indigo-900 uppercase mb-1">Recommended Action</p>
                                    <p className="text-sm text-indigo-800">{suggestion.suggestion}</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Draft Email</p>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">"{suggestion.emailDraft}"</p>
                                    <div className="mt-2 flex justify-end">
                                        <button className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
                                            <Send className="w-3 h-3" /> Copy to Clipboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800">Activity Timeline</h3>
                        </div>
                        
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-8">
                            {/* Log New Interaction Input */}
                            <div className="ml-8 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 transition-shadow focus-within:shadow-md focus-within:border-indigo-200">
                                <textarea 
                                    id="log-activity-input"
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder-slate-400"
                                    placeholder="Log a call, email, or note..."
                                    rows={2}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setInteractionType(InteractionType.CALL)}
                                            className={`p-1.5 rounded transition-colors ${interactionType === InteractionType.CALL ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                            title="Log Call"
                                        >
                                            <Phone className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => setInteractionType(InteractionType.EMAIL)}
                                            className={`p-1.5 rounded transition-colors ${interactionType === InteractionType.EMAIL ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                            title="Log Email"
                                        >
                                            <Mail className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => setInteractionType(InteractionType.MEETING)}
                                            className={`p-1.5 rounded transition-colors ${interactionType === InteractionType.MEETING ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                            title="Log Meeting"
                                        >
                                            <Calendar className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => setInteractionType(InteractionType.NOTE)}
                                            className={`p-1.5 rounded transition-colors ${interactionType === InteractionType.NOTE ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                            title="Log Note"
                                        >
                                            <MessageSquare className="w-4 h-4"/>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{interactionType}</span>
                                        <button 
                                            onClick={handleSaveInteraction}
                                            disabled={!newNote.trim()}
                                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Save Activity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {contactInteractions.length === 0 && (
                                <div className="ml-8 text-sm text-slate-400 italic">No interaction history yet.</div>
                            )}

                            {contactInteractions.map((interaction) => (
                                <div key={interaction.id} className="relative ml-8 group animate-in slide-in-from-left-2 duration-300">
                                    <span className={`absolute -left-[41px] top-1 border-2 w-5 h-5 rounded-full bg-white ${
                                        interaction.type === InteractionType.CALL ? 'border-blue-200' : 
                                        interaction.type === InteractionType.EMAIL ? 'border-purple-200' : 
                                        'border-indigo-200'
                                    }`}></span>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                {interaction.type} 
                                                <span className="text-xs font-normal text-slate-400">• {new Date(interaction.date).toLocaleDateString()} {new Date(interaction.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{interaction.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrichment Modal */}
            {showEnrichModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Lusha-Style Enrichment</h3>
                        <p className="text-sm text-slate-500 mb-4">Paste raw text (LinkedIn bio, email signature, etc.) and Gemini will extract structured data.</p>
                        
                        <textarea 
                            value={rawEnrichText} 
                            onChange={(e) => setRawEnrichText(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-4"
                            placeholder="Paste text here..."
                        ></textarea>
                        
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowEnrichModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button 
                                onClick={handleEnrichment} 
                                disabled={enriching}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-70"
                            >
                                {enriching ? 'Analyzing...' : 'Extract Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactDetail;