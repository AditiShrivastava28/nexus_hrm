import React from 'react';
import { NavItem, User } from '../types';
import { IconHome, IconUser, IconWallet, IconUsers, IconBriefcase, IconBell, IconFileEdit, IconChevronLeft, IconSettings, IconShield, IconLogout, IconBulb } from './Icons';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar, onLogout, user }) => {
  
  const sections = [
    {
      title: 'Home',
      items: [{ id: NavItem.HOME, icon: IconHome, label: 'Dashboard' }]
    },
    {
      title: 'My Space',
      items: [
        { id: NavItem.ME, icon: IconUser, label: 'Me' },
        { id: NavItem.INBOX, icon: IconBell, label: 'Inbox' },
        { id: NavItem.FINANCES, icon: IconWallet, label: 'My Finances' },
        { id: NavItem.PERFORMANCE, icon: IconBulb, label: 'Performance' },
      ]
    },
    {
      title: 'Organization',
      items: [
        { id: NavItem.TEAM, icon: IconUsers, label: 'My Team' },
        { id: NavItem.ORG, icon: IconBriefcase, label: 'Directory' },
        { id: NavItem.ADMIN, icon: IconShield, label: 'Admin' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: NavItem.RESUME, icon: IconFileEdit, label: 'Resume Builder' },
        { id: NavItem.SETTINGS, icon: IconSettings, label: 'Settings' },
      ]
    }
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/5 flex flex-col z-20 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`} 
      id="main-sidebar"
    >
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/5 relative">
        <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${!isOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-zinc-800 dark:text-white font-bold text-xl tracking-tight whitespace-nowrap uppercase">NexusHR</span>
        </div>
        
        {!isOpen && (
           <div className="w-full flex justify-center">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
             </div>
           </div>
        )}

        <button 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-6 bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-white/10 rounded-full p-1 shadow-md z-50 hover:text-indigo-600 transition-colors"
        >
          <IconChevronLeft className={`w-3 h-3 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-6">
            {isOpen && (
              <p className="px-6 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2">
                {section.title}
              </p>
            )}
            <nav className="px-3 space-y-1">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                      ${isActive 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                      }
                      ${!isOpen ? 'justify-center' : ''}
                    `}
                    title={!isOpen ? item.label : ''}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
                    <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'opacity-0 w-0 absolute' : 'opacity-100 w-auto'}`}>
                       {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${!isOpen ? 'justify-center' : ''}`}>
          <div className="relative shrink-0">
             <img src={user?.avatarUrl} alt="P" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-zinc-800" />
             <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full"></span>
          </div>
          <div className={`flex-1 min-w-0 ${!isOpen ? 'hidden' : 'block'}`}>
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 mt-2 px-3 py-2 text-zinc-400 hover:text-red-600 transition-colors rounded-xl ${!isOpen ? 'justify-center' : ''}`}
          title="Sign Out"
        >
          <IconLogout className="w-4 h-4" />
          {isOpen && <span className="text-xs font-bold uppercase tracking-widest">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;