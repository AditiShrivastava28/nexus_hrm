import React from 'react';
import { IconFileText, IconDownload, IconUsers, IconSearch } from './Icons';

const OrgView: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Organization</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Documents Column */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-zinc-200 dark:border-slate-700/50 p-6 shadow-sm">
               <h3 className="text-zinc-800 dark:text-slate-200 font-semibold mb-6 flex items-center gap-2">
                 <IconFileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Company Policies
               </h3>
               
               <div className="space-y-3">
                 {['Employee Handbook 2024', 'IT Security Policy', 'Leave & Attendance Policy', 'Travel Expense Guidelines'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-slate-900/50 border border-zinc-200 dark:border-slate-800 rounded-xl hover:border-zinc-300 dark:hover:border-slate-600 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-red-500 dark:text-red-400">
                             <span className="text-xs font-bold">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white">{doc}</p>
                            <p className="text-xs text-zinc-500 dark:text-slate-500">Updated Nov 2024 • 1.2 MB</p>
                          </div>
                       </div>
                       <button className="text-zinc-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                          <IconDownload className="w-5 h-5" />
                       </button>
                    </div>
                 ))}
               </div>
            </div>
         </div>

         {/* Stats / Quick Info */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-800 to-indigo-950 dark:from-indigo-900 dark:to-slate-900 rounded-2xl p-6 border border-indigo-500/30 text-center relative overflow-hidden shadow-lg">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
               <IconUsers className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
               <h3 className="text-3xl font-bold text-white">4,281</h3>
               <p className="text-indigo-200 text-sm">Total Employees</p>
               <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-white">124</p>
                    <p className="text-xs text-indigo-300">New Joiners</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">12</p>
                    <p className="text-xs text-indigo-300">Open Roles</p>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-zinc-200 dark:border-slate-700/50 p-6 shadow-sm">
               <h3 className="text-zinc-800 dark:text-slate-200 font-semibold mb-4 text-sm uppercase">Find an Employee</h3>
               <div className="relative">
                 <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Search by name or department..."
                   className="w-full bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                 />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OrgView;