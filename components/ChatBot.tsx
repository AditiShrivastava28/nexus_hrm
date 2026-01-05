import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { IconBot, IconSend, IconXCircle, IconMinimize, IconSparkles, IconCheckCircle } from './Icons';
import { COMPANY_POLICIES } from '../constants';
import { User } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  actionData?: {
    type: 'LEAVE_APPLIED';
    // Fix: Updated type to leaveType to match tool definition and usage
    details: { date: string; leaveType: string; reason: string };
  };
}

interface ChatBotProps {
    user: User | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: `NexusAI active. Hello ${user?.name?.split(' ')[0] || 'there'}. How can I assist with HR or policies today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const applyLeaveTool: FunctionDeclaration = {
    name: "applyLeave",
    description: "Apply for a leave of absence for an employee.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "The start date of the leave in YYYY-MM-DD format." },
        reason: { type: Type.STRING, description: "The reason given for the leave." },
        leaveType: { type: Type.STRING, enum: ["Sick Leave", "Casual Leave", "Privilege Leave"], description: "The category of the leave." }
      },
      required: ["date", "reason", "leaveType"]
    }
  };

  const initChat = () => {
    if (!process.env.API_KEY || !user) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemContext = `
        You are NexusAI, the HR assistant for a professional HRMS platform.
        Current Employee: ${user.name} (${user.role}).
        Policies: ${COMPANY_POLICIES}.
        Tone: Professional, succinct, and helpful. 
        Capabilities: You can answer policy questions and help apply for leaves using tools.
      `;
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { 
          systemInstruction: systemContext, 
          tools: [{ functionDeclarations: [applyLeaveTool] }] 
        },
      });
    } catch (error) { 
      console.error("AI Initialization Error:", error); 
    }
  };

  useEffect(() => { 
    if (isOpen && !chatRef.current) initChat(); 
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let response = await chatRef.current.sendMessage({ message: userMsg.text });
      let actionData = undefined;

      if (response.functionCalls?.length) {
         const fc = response.functionCalls[0];
         // Simulate internal process completion
         actionData = { type: 'LEAVE_APPLIED', details: fc.args as any };
         
         // Send the tool response back to the model
         response = await chatRef.current.sendMessage({
           message: [
             {
               functionResponse: {
                 name: fc.name,
                 response: { result: 'Leave application submitted to manager for approval.' },
                 id: fc.id
               }
             }
           ]
         });
      }

      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now()+1).toString(), 
          role: 'model', 
          text: response.text || "I've processed your request.", 
          actionData: actionData as any 
        }
      ]);
    } catch (error) { 
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Apologies, I encountered a temporary connection issue. Please try again." }]); 
    } finally { 
      setIsTyping(false); 
    }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center text-white transition-all transform hover:scale-110 z-50 group border border-indigo-400/30"
      >
        <IconBot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden ${isMinimized ? 'bottom-0 right-8 w-72 h-14 rounded-b-none' : 'bottom-6 right-6 w-[380px] h-[600px]'}`}>
      <div className="h-14 bg-indigo-600 flex items-center justify-between px-4 shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
         <div className="flex items-center gap-3">
            <IconSparkles className="w-5 h-5 text-indigo-200" />
            <h3 className="text-white font-bold text-sm tracking-wide">NexusAI</h3>
         </div>
         <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 text-indigo-200 hover:text-white"><IconMinimize className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 text-indigo-200 hover:text-white"><IconXCircle className="w-4 h-4" /></button>
         </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950 custom-scrollbar">
            {messages.map((msg) => (
               <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-bl-none'}`}>
                     {msg.text}
                  </div>
                  {msg.actionData && (
                     <div className="mt-2 w-[85%] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 flex gap-3">
                        <IconCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="flex-1">
                           <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Request Sent</p>
                           <p className="text-[10px] text-zinc-500 mt-1">{msg.actionData.details.leaveType} for {msg.actionData.details.date}</p>
                        </div>
                     </div>
                  )}
               </div>
            ))}
            {isTyping && <div className="ml-2 text-[10px] text-indigo-600 font-bold animate-pulse">AI is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10">
             <div className="relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Ask me something..." 
                  className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all" 
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim()} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <IconSend className="w-4 h-4" />
                </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;