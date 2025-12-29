
import React, { useState } from 'react';
import { IconCheckCircle, IconClock, IconPlus, IconSparkles, IconLayout, IconBulb, IconUsers, IconChevronRight, IconAlertCircle } from './Icons';
import { Goal } from '../types';

const PerformanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Goals' | 'Reviews' | 'Feedback'>('Goals');

  const goals: Goal[] = [
    { id: '1', title: 'Modernize HR Dashboard UI', category: 'Objective', progress: 75, dueDate: 'Mar 31, 2024', status: 'On Track' },
    { id: '2', title: 'Reduce API Latency by 40%', category: 'Key Result', progress: 30, dueDate: 'Apr 15, 2024', status: 'At Risk' },
    { id: '3', title: 'Learn Advanced Framer Motion', category: 'Personal', progress: 100, dueDate: 'Feb 20, 2024', status: 'Completed' },
  ];

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'On Track': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'At Risk': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'Completed': return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20';
      default: return 'text-zinc-500 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Performance</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your growth and impact</p>
        </div>
        <button className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
          <IconPlus className="w-5 h-5" /> New Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 dark:border-white/5">
        {['Goals', 'Reviews', 'Feedback'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Goals List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{goal.category}</span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{goal.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Progress</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <IconClock className="w-4 h-4" /> Due {goal.dueDate}
                    </div>
                    <button className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                      Update Progress <IconChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><IconSparkles className="w-20 h-20" /></div>
              <h3 className="text-lg font-bold mb-2 relative z-10">AI Insights</h3>
              <p className="text-cyan-50 text-sm leading-relaxed relative z-10">
                You've completed 85% of your objectives for Q1. Focus on the API Latency goal to maintain your high-performance streak.
              </p>
              <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-all relative z-10">
                Generate Growth Plan
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase mb-4">Competencies</h3>
              <div className="space-y-4">
                {[
                  { label: 'Technical Skills', value: 92 },
                  { label: 'Communication', value: 78 },
                  { label: 'Problem Solving', value: 88 },
                  { label: 'Leadership', value: 65 }
                ].map((comp) => (
                  <div key={comp.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">{comp.label}</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{comp.value}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-50 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${comp.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconLayout className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Annual Review Cycle</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            The 2024 Performance Review cycle hasn't started yet. You will be notified when self-assessments are open.
          </p>
        </div>
      )}

      {activeTab === 'Feedback' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl text-cyan-600">
                <IconBulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Request Feedback</h3>
                <p className="text-sm text-zinc-500">Ask colleagues for constructive feedback</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-50 dark:hover:bg-cyan-500/5 transition-all">Send Request</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceView;
