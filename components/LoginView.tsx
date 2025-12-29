
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
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const payload = isLogin 
        ? { email, password }
        : { email, password, full_name: fullName };

      // Using authenticatedFetch allows us to use the Mock Fallback system defined in constants.ts
      // if the real backend is down.
      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
      }

      // Success
      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        onLoginSuccess(data.user || { name: 'User', role: 'Employee' });
      } else {
        setIsLogin(true);
        setError(null);
        alert("Account created successfully! Please log in.");
        setLoading(false);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to connect to server. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]"></div>
         <div className="bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 absolute inset-0"></div>
      </div>

      {/* Theme Toggle */}
      <button 
        onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 backdrop-blur-sm border border-zinc-200 dark:border-white/10 transition-colors z-20"
      >
        {currentTheme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="mb-8 text-center">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-6">
              <span className="text-white font-bold text-3xl">N</span>
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">NexusHR</h1>
           <p className="text-zinc-500 dark:text-zinc-400">Enterprise Workforce Management</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-200 dark:border-white/10 p-8 shadow-2xl">
           
           <div className="flex gap-4 mb-8 bg-zinc-100 dark:bg-black/40 p-1.5 rounded-xl border border-zinc-200 dark:border-white/5">
              <button 
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Sign Up
              </button>
           </div>

           {error && (
             <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                <IconXCircle className="w-5 h-5 shrink-0" />
                {error}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1.5 animate-in slide-in-from-left-2 fade-in duration-300">
                   <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
                   <div className="relative group">
                      <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        type="text" 
                        required={!isLogin}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-400"
                        placeholder="John Doe"
                      />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
                 <div className="relative group">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-400"
                      placeholder="name@company.com"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
                 <div className="relative group">
                    <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-400"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                   <><IconShield className="w-5 h-5" /> {isLogin ? 'Sign In' : 'Create Account'}</>
                )}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
