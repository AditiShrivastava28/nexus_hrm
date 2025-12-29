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
    details: { date: string; type: string; reason: string };
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
    { id: 'welcome', role: 'model', text: `Systems online. I am NexusAI. How can I assist you today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const applyLeaveTool: FunctionDeclaration = {
    name: "applyLeave",
    description: "Apply for a leave of absence.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "YYYY-MM-DD format." },
        reason: { type: Type.STRING },
        leaveType: { type: Type.STRING, enum: ["Sick Leave", "Casual Leave", "Privilege Leave"] }
      },
      required: ["date", "reason", "leaveType"]
    }
  };

  const initChat = () => {
    if (!process.env.API_KEY || !user) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemContext = `
        You are NexusAI, an advanced HR assistant.
        User: ${user.name}.
        Role: HR Bot. Tone: Professional, Efficient, Robotic but helpful.
        Policies: ${COMPANY_POLICIES}.
        Tools: applyLeave.
      `;
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: systemContext, tools: [{ functionDeclarations: [applyLeaveTool] }] },
      });
    } catch (error) { console.error(error); }
  };

  useEffect(() => { if (isOpen && !chatRef.current) initChat(); }, [isOpen]);

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
         // Simulate action
         actionData = { type: 'LEAVE_APPLIED', details: response.functionCalls[0].args as any };
         response = await chatRef.current.sendMessage({
           message: [{
             functionResponse: {
               name: response.functionCalls[0].name,
               response: { result: 'success' },
               id: response.functionCalls[0].id
             }
           }]
         });
      }
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: response.text || "Processed.", actionData: actionData as any }]);
    } catch (error) { setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "System error." }]); } 
    finally { setIsTyping(false); }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center text-white transition-all transform hover:scale-110 z-50 group border border-cyan-400/50">
        <IconBot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span></span>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col overflow-hidden ${isMinimized ? 'bottom-0 right-8 w-72 h-14 rounded-b-none' : 'bottom-6 right-6 w-[380px] h-[600px]'}`}>
      <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
         <div className="flex items-center gap-3">
            <IconSparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold text-sm tracking-wide">NexusAI <span className="text-[10px] text-zinc-500 font-normal ml-1">v2.1</span></h3>
         </div>
         <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 text-zinc-400 hover:text-white"><IconMinimize className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 text-zinc-400 hover:text-white"><IconXCircle className="w-4 h-4" /></button>
         </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
            {messages.map((msg) => (
               <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'model' && <div className="text-[10px] text-zinc-500 mb-1 ml-1 uppercase tracking-wider">System</div>}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${msg.role === 'user' ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-100 rounded-br-none' : 'bg-white/5 border-white/5 text-zinc-300 rounded-bl-none'}`}>
                     {msg.text}
                  </div>
                  {msg.actionData && (
                     <div className="mt-2 w-[85%] bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3"><IconCheckCircle className="w-5 h-5 text-emerald-400" /><div className="flex-1"><p className="text-xs font-bold text-emerald-400 uppercase">Success</p><p className="text-xs text-zinc-400 mt-1">{msg.actionData.details.type} • {msg.actionData.details.date}</p></div></div>
                  )}
               </div>
            ))}
            {isTyping && <div className="ml-4 text-xs text-cyan-500 animate-pulse">Processing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white/5 border-t border-white/5">
             <div className="relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Execute command..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-zinc-600 font-mono" />
                <button onClick={handleSend} disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"><IconSend className="w-4 h-4" /></button>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;