import React, { useState } from 'react';
import { IconMail, IconKey, IconShield, IconUser, IconXCircle, IconSun, IconMoon } from './Icons';
import { authenticatedFetch } from '../constants';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  currentTheme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, currentTheme, setTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, full_name: fullName };

      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        onLoginSuccess(data.user || { name: 'Alex Rivera', role: 'Senior Product Designer' });
      } else {
        setIsLogin(true);
        alert("Account created! Please sign in.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Server connection failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#030712] transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-md z-10 p-4">
        <div className="mb-10 text-center">
           <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 transform rotate-3">
              <span className="text-white font-black text-2xl">N</span>
           </div>
           <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Welcome to NexusHR</h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Everything you need to work your best.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/10 p-8">
           
           <div className="flex gap-1 mb-8 bg-zinc-100 dark:bg-black/40 p-1 rounded-2xl border border-zinc-200 dark:border-white/5">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Sign Up
              </button>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
                <IconXCircle className="w-4 h-4 shrink-0" />
                {error}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                   <input 
                      type="text" 
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Enter your name"
                   />
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email ID</label>
                 <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="name@company.com"
                 />
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Password</label>
                    {isLogin && <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline">Forgot?</button>}
                 </div>
                 <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                 />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 flex items-center justify-center transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Join Nexus')}
              </button>
           </form>

           <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-white/5 text-center">
              <p className="text-xs text-zinc-500">Log in with corporate SSO for secure access.</p>
           </div>
        </div>

        <div className="mt-12 flex justify-center gap-6">
           <button onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
              {currentTheme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;