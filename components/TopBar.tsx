import React from 'react';
import { IconSearch, IconBell } from './Icons';

const TopBar: React.FC = () => {
  return (
    <header className="h-16 bg-white/70 dark:bg-black/20 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md group">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search ecosystem..." 
            className="w-full bg-zinc-100 dark:bg-black/40 border border-transparent dark:border-white/10 text-zinc-800 dark:text-zinc-300 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg">
          <IconBell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;