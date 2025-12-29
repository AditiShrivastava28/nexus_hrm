import React, { useState, useEffect } from 'react';
import { IconMessage, IconMapPin, IconSearch, IconChevronLeft, IconSend, IconBriefcase, IconUsers, IconUser } from './Icons';
import { authenticatedFetch } from '../constants';

interface TeamMember {
  id: number;
  name: string;
  designation: string; // Mapped from backend
  department: string;
  status: string;
  location: string;
  avatar_url: string; // Mapped from backend
  email: string;
  mobile: string;
  join_date: string;
  isOnline: boolean; // Derived
}

interface ChatMessage {
  id: string;
  senderId: number | 'me';
  text: string;
  time: string;
}

const TeamView: React.FC = () => {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [viewMode, setViewMode] = useState<'my_team' | 'directory'>('my_team');
  const [myTeamMembers, setMyTeamMembers] = useState<TeamMember[]>([]);
  const [directoryMembers, setDirectoryMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Fetch My Team (Direct Teammates)
        const myTeamResponse = await authenticatedFetch('/team');
        if (myTeamResponse.ok) {
          const myTeamData = await myTeamResponse.json();
          setMyTeamMembers(mapBackendData(myTeamData));
        }

        // 2. Fetch Company Directory (All Employees)
        const directoryResponse = await authenticatedFetch('/team/members');
        if (directoryResponse.ok) {
          const dirData = await directoryResponse.json();
          setDirectoryMembers(mapBackendData(dirData));
        }

      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper to map backend response to UI structure
  const mapBackendData = (data: any[]): TeamMember[] => {
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        designation: item.designation || 'Employee',
        department: item.department || 'General',
        status: item.status || 'Active',
        location: item.location || 'Remote',
        avatar_url: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
        email: item.email || '',
        mobile: item.mobile || '',
        join_date: item.join_date || '',
        isOnline: ['Active', 'Working', 'Available'].includes(item.status)
      }));
  };

  const currentList = viewMode === 'my_team' ? myTeamMembers : directoryMembers;

  const filteredMembers = currentList.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeMember) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeMember.id]: [...(prev[activeMember.id] || []), newMessage]
    }));
    setChatInput('');
  };

  const currentMessages = activeMember ? (messages[activeMember.id] || []) : [];

  // Helper to determine status color
  const getStatusColorClass = (status: string) => {
      const lower = status.toLowerCase();
      if (lower.includes('active') || lower.includes('working')) return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      if (lower.includes('leave') || lower.includes('inactive')) return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
      if (lower.includes('meeting') || lower.includes('busy')) return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
  };

  const getStatusDotColor = (status: string) => {
      const lower = status.toLowerCase();
      if (lower.includes('active') || lower.includes('working')) return 'bg-emerald-500';
      if (lower.includes('leave') || lower.includes('inactive')) return 'bg-red-500';
      if (lower.includes('meeting') || lower.includes('busy')) return 'bg-amber-500';
      return 'bg-indigo-500';
  };

  // --- Render Chat Interface ---
  if (activeMember) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden absolute inset-0 z-20">
        {/* Chat Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-white/10 flex items-center px-6 bg-white/50 dark:bg-black/20 backdrop-blur-md">
          <button 
            onClick={() => setActiveMember(null)}
            className="mr-4 p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img src={activeMember.avatar_url} alt={activeMember.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-white/10 object-cover" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-black ${activeMember.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}></div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{activeMember.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              {activeMember.designation} • <span className={activeMember.isOnline ? 'text-emerald-500' : 'text-zinc-500'}>{activeMember.isOnline ? 'Online' : 'Offline'}</span>
            </p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-50/50 dark:bg-black/20">
          <div className="text-center text-xs text-zinc-400 my-4 uppercase tracking-widest font-mono">Today</div>
          {currentMessages.length === 0 && (
             <div className="text-center py-10">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                   <IconBriefcase className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-zinc-500 text-sm">Start a conversation with {activeMember.name.split(' ')[0]}</p>
                {activeMember.department && <p className="text-zinc-400 text-xs mt-1">Department: {activeMember.department}</p>}
                {activeMember.email && <p className="text-zinc-400 text-xs">{activeMember.email}</p>}
             </div>
          )}
          {currentMessages.map((msg) => {
            const isMe = msg.senderId === 'me';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-cyan-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/5 rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-cyan-200' : 'text-zinc-400'}`}>{msg.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Footer */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..." 
              className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-400"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <IconSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Team List ---
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">People</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-4">Connect with your colleagues</p>
          
          {/* View Toggles */}
          <div className="flex p-1 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 w-fit">
             <button 
               onClick={() => setViewMode('my_team')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                 viewMode === 'my_team' 
                 ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                 : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
               }`}
             >
                <IconUsers className="w-4 h-4" /> My Team <span className="ml-1 opacity-60 text-xs bg-black/5 dark:bg-white/10 px-1.5 rounded-md">{myTeamMembers.length}</span>
             </button>
             <button 
               onClick={() => setViewMode('directory')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                 viewMode === 'directory' 
                 ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                 : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
               }`}
             >
                <IconBriefcase className="w-4 h-4" /> Directory <span className="ml-1 opacity-60 text-xs bg-black/5 dark:bg-white/10 px-1.5 rounded-md">{directoryMembers.length}</span>
             </button>
          </div>
        </div>

        <div className="relative">
           <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
           <input 
              type="text" 
              placeholder={`Search ${viewMode === 'my_team' ? 'team' : 'directory'}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 placeholder:text-zinc-400"
           />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
             <div className="flex items-center justify-center h-full text-zinc-500">
                 <div className="flex flex-col items-center gap-3">
                     <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-sm">Loading...</p>
                 </div>
             </div>
        ) : filteredMembers.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-full">
                   <IconUsers className="w-8 h-8 opacity-50" />
                </div>
                <p>No members found in {viewMode === 'my_team' ? 'your team' : 'directory'}.</p>
             </div>
        ) : (
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 dark:bg-white/5 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-white/10" />
                         <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-black ${member.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${getStatusColorClass(member.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(member.status)}`}></span>
                        {member.status}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm text-zinc-600 dark:text-zinc-400">{member.department}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <IconMapPin className="w-4 h-4 text-zinc-400" />
                        {member.location}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button 
                       onClick={() => setActiveMember(member)}
                       className="p-2 text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                       title="Send Message"
                     >
                        <IconMessage className="w-5 h-5" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;