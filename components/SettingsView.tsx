import React from 'react';
import { IconSun, IconMoon, IconCheckCircle } from './Icons';

interface SettingsViewProps {
  currentTheme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, setTheme }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
       <div>
         <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
         <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your application preferences and workspace.</p>
       </div>

       <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">Appearance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <button 
               onClick={() => setTheme('light')}
               className={`group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${currentTheme === 'light' ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10' : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'}`}
             >
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                   <IconSun className="w-8 h-8" />
                </div>
                <div className="text-center">
                   <p className={`font-semibold ${currentTheme === 'light' ? 'text-cyan-700 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Light Mode</p>
                   <p className="text-xs text-zinc-500 mt-1">Clean and minimal.</p>
                </div>
                {currentTheme === 'light' && (
                   <div className="absolute top-4 right-4 text-cyan-500"><IconCheckCircle className="w-5 h-5" /></div>
                )}
             </button>

             <button 
               onClick={() => setTheme('dark')}
               className={`group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${currentTheme === 'dark' ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10' : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'}`}
             >
                <div className="w-16 h-16 rounded-full bg-indigo-900 text-indigo-400 flex items-center justify-center">
                   <IconMoon className="w-8 h-8" />
                </div>
                <div className="text-center">
                   <p className={`font-semibold ${currentTheme === 'dark' ? 'text-cyan-700 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Dark Mode</p>
                   <p className="text-xs text-zinc-500 mt-1">Professional and focused.</p>
                </div>
                {currentTheme === 'dark' && (
                   <div className="absolute top-4 right-4 text-cyan-500"><IconCheckCircle className="w-5 h-5" /></div>
                )}
             </button>
          </div>
       </div>

       <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm opacity-50 pointer-events-none grayscale">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">Notifications (Coming Soon)</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-zinc-900 dark:text-white font-medium">Email Alerts</p>
                   <p className="text-xs text-zinc-500">Receive daily summaries.</p>
                </div>
                <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow"></div></div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SettingsView;