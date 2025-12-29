
import React, { useState, useEffect } from 'react';
import { IconCheckCircle, IconClock, IconFileText, IconTrash } from './Icons';

interface Task {
  id: number;
  type: string;
  title: string;
  requester: string;
  date: string;
  avatar: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const InboxView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Simulate fetching inbox items from backend (localStorage)
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('nexus_inbox_tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks) as Task[]);
        }
    };
    
    loadTasks();

    // Listen for updates from HomeView
    window.addEventListener('storage', loadTasks);
    return () => window.removeEventListener('storage', loadTasks);
  }, []);

  const handleAction = (id: number, action: 'Approve' | 'Reject') => {
      const updatedTasks = tasks.map(t => 
        t.id === id ? { ...t, status: (action === 'Approve' ? 'Approved' : 'Rejected') as Task['status'] } : t
      );
      setTasks(updatedTasks);
      localStorage.setItem('nexus_inbox_tasks', JSON.stringify(updatedTasks));
  };

  const handleClear = () => {
      if(confirm('Clear all tasks?')) {
          setTasks([]);
          localStorage.removeItem('nexus_inbox_tasks');
      }
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const historyTasks = tasks.filter(t => t.status !== 'Pending');

  return (
    <div className="p-8 max-w-5xl mx-auto h-full">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Inbox</h1>
         <div className="flex gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white text-xs font-bold px-3 py-1 rounded-full">{pendingTasks.length} Pending</span>
            <button onClick={handleClear} className="text-zinc-400 hover:text-red-500 text-xs flex items-center gap-1 px-3 py-1"><IconTrash className="w-3 h-3" /> Clear</button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 && (
          <div className="mt-8 text-center py-12 border-2 border-dashed border-zinc-300 dark:border-slate-800 rounded-xl animate-in fade-in">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheckCircle className="w-8 h-8 text-zinc-400 dark:text-slate-600" />
             </div>
             <p className="text-zinc-500 dark:text-slate-400 font-medium">You are all caught up!</p>
             <p className="text-sm text-zinc-400 dark:text-slate-600">No new notifications to display.</p>
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-zinc-900 rounded-xl border-l-4 border-l-amber-500 border border-zinc-200 dark:border-white/5 p-4 shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <img src={task.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-white/10" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{task.title}</h3>
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Pending</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                <IconClock className="w-3 h-3" /> {task.date} • Requester: {task.requester}
                            </p>
                            <div className="mt-3 p-3 bg-zinc-50 dark:bg-black/20 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 italic border border-zinc-100 dark:border-white/5">
                                "{task.details}"
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleAction(task.id, 'Reject')} className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 transition-colors">Reject</button>
                        <button onClick={() => handleAction(task.id, 'Approve')} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-colors">Approve</button>
                    </div>
                </div>
            </div>
        ))}

        {/* History / Processed */}
        {historyTasks.length > 0 && <h3 className="text-xs font-bold text-zinc-400 uppercase mt-6 mb-2">History</h3>}
        {historyTasks.map((task) => (
            <div key={task.id} className={`opacity-60 grayscale hover:grayscale-0 transition-all bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/5 p-4`}>
                <div className="flex items-center justify-between">
                     <div className="flex gap-4 items-center">
                        <div className={`p-2 rounded-full ${task.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            <IconFileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{task.title}</h3>
                            <p className="text-xs text-zinc-500">{task.status} on {new Date().toLocaleDateString()}</p>
                        </div>
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded ${task.status === 'Approved' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{task.status}</span>
                </div>
            </div>
        ))}

      </div>
    </div>
  );
};

export default InboxView;
