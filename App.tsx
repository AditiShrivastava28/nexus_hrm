
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FinancesView from './components/FinancesView';
import HomeView from './components/HomeView';
import MeView from './components/MeView';
import InboxView from './components/InboxView';
import TeamView from './components/TeamView';
import OrgView from './components/OrgView';
import ResumeBuilderView from './components/ResumeBuilderView';
import SettingsView from './components/SettingsView';
import AdminView from './components/AdminView';
import PerformanceView from './components/PerformanceView';
import ChatBot from './components/ChatBot';
import LoginView from './components/LoginView';
import { NavItem, User } from './types';
import { authenticatedFetch } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState<NavItem>(NavItem.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoleBasedAvatar = (role: string = 'Employee') => {
      return `https://cdn-icons-png.flaticon.com/512/3135/3135715.png`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const fetchProfile = async () => {
      if (!token) {
        // Still fetch for mock session if needed
        try {
           const response = await authenticatedFetch('/users/me');
           if(response.ok) {
             const data = await response.json();
             setUser({
               id: data.id?.toString() || '1',
               name: data.full_name || 'Alex Rivera',
               role: data.role || 'Senior Product Designer',
               department: data.department || 'Design',
               employeeId: data.employee_id || 'EMP-2024-8842',
               avatarUrl: data.avatar_url || getRoleBasedAvatar(data.role)
             });
             setIsAuthenticated(true);
             setLoading(false);
             return;
           }
        } catch(e) {}
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch('/users/me');
        if (response.ok) {
          const userData = await response.json();
          const mappedUser: User = {
            id: userData.id?.toString() || '0',
            name: userData.full_name || 'User',
            role: userData.role || 'Employee',
            department: userData.department || 'General',
            employeeId: userData.employee_id || `EMP-${userData.id || '000'}`,
            avatarUrl: userData.avatar_url || getRoleBasedAvatar(userData.role)
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error: any) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (apiUser: any) => {
    const userRole = apiUser?.role || 'Employee';
    const mappedUser: User = {
        id: apiUser?.id?.toString() || '0',
        name: apiUser?.full_name || apiUser?.name || 'Nexus User',
        role: userRole,
        department: apiUser?.department || 'General',
        employeeId: apiUser?.employee_id || `EMP-${apiUser?.id || '000'}`,
        avatarUrl: apiUser?.avatar_url || getRoleBasedAvatar(userRole)
    };

    setUser(mappedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null); 
  };

  if (loading) {
     return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-sm font-medium">Initializing NexusHR...</span>
        </div>
     </div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginView 
        onLoginSuccess={handleLoginSuccess} 
        currentTheme={theme} 
        setTheme={setTheme} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden transition-colors duration-300">
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-5] opacity-40 mix-blend-screen pointer-events-none hidden dark:block"
      >
        <source src="https://cdn.pixabay.com/video/2019/04/20/22908-331663189_large.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-[-4] pointer-events-none hidden dark:block"></div>
      
      <div className="relative z-10 flex min-h-screen">
        
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          user={user}
        />

        <div 
          className={`flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`} 
          id="main-content"
        >
          <div id="no-print-topbar">
            <TopBar />
          </div>

          <main 
            className={`flex-1 overflow-x-hidden ${activeTab === NavItem.RESUME ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar p-6'}`}
          >
            {activeTab === NavItem.HOME && <HomeView user={user} />}
            {activeTab === NavItem.ME && <MeView user={user} />}
            {activeTab === NavItem.INBOX && <InboxView />}
            {activeTab === NavItem.TEAM && <TeamView />}
            {activeTab === NavItem.FINANCES && <FinancesView user={user} />}
            {activeTab === NavItem.PERFORMANCE && <PerformanceView />}
            {activeTab === NavItem.ORG && <OrgView />}
            {activeTab === NavItem.ADMIN && <AdminView />}
            {activeTab === NavItem.RESUME && <ResumeBuilderView user={user} />}
            {activeTab === NavItem.SETTINGS && <SettingsView currentTheme={theme} setTheme={setTheme} />}
          </main>
        </div>

      </div>

      <div id="no-print-chat">
        <ChatBot user={user} />
      </div>
    </div>
  );
}

export default App;
