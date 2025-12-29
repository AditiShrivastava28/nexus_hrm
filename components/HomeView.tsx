
import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconSun, IconBriefcase, IconPlay, IconStopCircle, IconChevronLeft, IconChevronRight, IconX,
  IconMapPin, IconHistory, IconHome, IconCoffee, IconClock, IconAlertCircle, IconCalendar, IconCheckCircle, IconFileText, IconLaptop, IconMessage, IconShield, IconSparkles
} from './Icons';
import { authenticatedFetch } from '../constants';

// --- Types for Local Data ---
interface LeaveEntry {
  date: string; // YYYY-MM-DD
  users: Array<{ name: string; avatar: string; type: string }>;
}

interface LogEntry {
  id: number;
  time: string;
  rawTime: number; // Timestamp for calculation
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  location: string;
}

interface LeaveBalance {
  leave_type: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

interface LeaveHistoryItem {
  id: number;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  leave_type: string;
}

interface WfhHistoryItem {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status?: string;
}

interface Holiday {
  date: string;
  occasion: string;
  type: string;
  is_ai_generated?: boolean;
}

// --- Helper for API Action Normalization ---
const normalizeActionType = (action: string | undefined): LogEntry['type'] => {
  if (!action) return 'CLOCK_IN';
  const upper = action.toString().toUpperCase().replace(/[-_\s]/g, '_'); 
  
  if (upper.includes('CLOCK_IN') || upper === 'IN') return 'CLOCK_IN';
  if (upper.includes('CLOCK_OUT') || upper === 'OUT') return 'CLOCK_OUT';
  if (upper.includes('BREAK_START') || upper === 'START_BREAK' || upper === 'BREAK') return 'BREAK_START';
  if (upper.includes('BREAK_END') || upper === 'END_BREAK' || upper === 'RESUME') return 'BREAK_END';
  
  return 'CLOCK_IN'; // Default fallback
};

const getDaysDiff = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if(isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diff = d2.getTime() - d1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

// --- Reusable Components ---

const Modal = ({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const CalendarWidget = ({ 
  selectedDate, 
  onDateSelect, 
  events = [] 
}: { 
  selectedDate: Date | null, 
  onDateSelect: (d: Date) => void,
  events?: LeaveEntry[] 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const days = [];
  const totalDays = daysInMonth(currentMonth);
  const startDay = firstDayOfMonth(currentMonth); 

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const hasEvent = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(e => e.date === dateStr);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
       <div className="flex justify-between items-center mb-4">
         <button onClick={prevMonth} className="p-1 text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"><IconChevronLeft className="w-5 h-5" /></button>
         <span className="font-semibold text-zinc-800 dark:text-zinc-100">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
         <button onClick={nextMonth} className="p-1 text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"><IconChevronRight className="w-5 h-5" /></button>
       </div>
       <div className="grid grid-cols-7 gap-1 mb-2 text-center">
         {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] text-zinc-400 font-bold uppercase">{d}</span>)}
       </div>
       <div className="grid grid-cols-7 gap-1">
         {days.map((day, idx) => {
           if (!day) return <div key={`empty-${idx}`}></div>;
           
           const event = hasEvent(day);
           const selected = isSelected(day);

           return (
             <button 
               key={day}
               onClick={() => onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
               className={`h-8 w-8 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all relative
                 ${selected 
                   ? 'bg-cyan-600 text-white shadow-md' 
                   : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'}
               `}
             >
               {day}
               {event && !selected && (
                 <span className="absolute bottom-1 w-1 h-1 bg-violet-500 rounded-full"></span>
               )}
             </button>
           );
         })}
       </div>
    </div>
  );
};


const HomeView: React.FC<{ user?: any }> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'history'>('dashboard');
  const [historyType, setHistoryType] = useState<'leave' | 'wfh' | 'help' | 'early_late'>('leave');
  
  const [status, setStatus] = useState<'IDLE' | 'WORKING' | 'BREAK'>('IDLE');
  const [startTime, setStartTime] = useState<number | null>(null); // For current session
  const [firstClockIn, setFirstClockIn] = useState<number | null>(null);
  const [clockInDisplay, setClockInDisplay] = useState<string>('--:--');
  const [clockOutDisplay, setClockOutDisplay] = useState<string>('--:--');
  const [backendTotalHours, setBackendTotalHours] = useState<string>('');
  
  const [now, setNow] = useState(Date.now());
  const [activeModal, setActiveModal] = useState<'NONE' | 'WFH' | 'APPLY_LEAVE' | 'EARLY_LATE' | 'HELP' | 'CALENDAR'>('NONE');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workLocation, setWorkLocation] = useState('Office');
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [requestReason, setRequestReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // -- Toaster State --
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // -- Logs View State --
  const [logsViewMode, setLogsViewMode] = useState<'today' | 'history'>('today');
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  // -- Leave/WFH Specific State --
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('paid'); 
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryItem[]>([]);
  const [wfhHistory, setWfhHistory] = useState<WfhHistoryItem[]>([]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('first_half');
  
  // -- Early/Late Specific State --
  const [earlyLateType, setEarlyLateType] = useState('early_going');
  const [earlyLateDuration, setEarlyLateDuration] = useState(1);
  const [earlyLateHistory, setEarlyLateHistory] = useState<any[]>([]);

  // -- Help Ticket Specific State --
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('IT Support');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [helpHistory, setHelpHistory] = useState<any[]>([]);
  
  // -- Leave Balances State (API Data) --
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  // -- Holiday Calendar State --
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Early/Late History from API on mount
  useEffect(() => {
      fetchEarlyLateHistory();
      fetchHelpHistory();
      fetchHolidays();
  }, []);

  // Ensure histories are fresh when opening that specific modal/history
  useEffect(() => {
      if (activeModal === 'EARLY_LATE') {
          fetchEarlyLateHistory();
      }
      if (activeModal === 'HELP') {
          fetchHelpHistory();
      }
  }, [activeModal]);

  const fetchLeaveBalances = async () => {
    try {
      const response = await authenticatedFetch('/leaves/balance');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
           setLeaveBalances(data);
        } else if (data && typeof data === 'object') {
           const total = data.total_days > 0 ? data.total_days : 12; 
           const used = data.used_days || 0;
           const remaining = data.remaining_days !== undefined ? data.remaining_days : (total - used);
           setLeaveBalances([{
              leave_type: 'Paid Leave',
              total_days: total,
              used_days: used,
              remaining_days: remaining
           }]);
        } else {
           setLeaveBalances([]);
        }
      } else {
        setLeaveBalances([]);
      }
    } catch (e) {
      console.warn("Could not fetch leave balances", e);
      setLeaveBalances([]);
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const response = await authenticatedFetch('/leaves/history');
      if (response.ok) {
        const data = await response.json();
        setLeaveHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Could not fetch leave history", e);
    }
  };

  const fetchWfhHistory = async () => {
    try {
        const response = await authenticatedFetch('/requests/wfh'); 
        if (response.ok) {
            const data = await response.json();
            setWfhHistory(Array.isArray(data) ? data : []);
        }
    } catch (e) {
        console.warn("Could not fetch WFH history", e);
    }
  };

  const fetchEarlyLateHistory = async () => {
      try {
          const response = await authenticatedFetch('/requests/early-late');
          if (response.ok) {
              const data = await response.json();
              // API returns list of objects
              setEarlyLateHistory(Array.isArray(data) ? data : []);
          } 
      } catch (e) {
          console.warn("Failed to fetch early/late history", e);
      }
  };

  const fetchAttendanceHistory = async () => {
      try {
          const response = await authenticatedFetch('/attendance/history');
          if (response.ok) {
              const data = await response.json();
              setAttendanceHistory(Array.isArray(data) ? data : []);
          }
      } catch (e) {
          console.warn("Failed to fetch attendance history", e);
      }
  };

  const fetchHelpHistory = async () => {
      try {
          const response = await authenticatedFetch('/requests/help');
          if (response.ok) {
              const data = await response.json();
              // Map backend help ticket response to UI structure
              // Expected: id, subject, message_body, category, status, created_at
              const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
                  id: item.id,
                  date: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                  title: item.subject,
                  details: item.message_body || item.description,
                  status: item.status || 'Pending'
              }));
              setHelpHistory(mapped);
          }
      } catch (e) {
          console.error("Failed to load help history", e);
      }
  };

  const fetchHolidays = async () => {
      try {
          const response = await authenticatedFetch('/leaves/corporate-calendar');
          if (response.ok) {
              const data = await response.json();
              setHolidays(Array.isArray(data) ? data : []);
          }
      } catch (e) {
          console.warn("Failed to fetch holiday calendar", e);
      }
  };

  // Fetch initial data on mount
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await authenticatedFetch('/attendance/today');
        if (response.ok) {
          const data = await response.json();
          processAttendanceData(data);
        }
      } catch (e) {
        console.warn("Could not fetch attendance details", e);
      }
    };
    fetchAttendanceData();
    fetchLeaveBalances();
    fetchWfhHistory();
  }, []);

  const processAttendanceData = (data: any) => {
      let rawLogs: LogEntry[] = [];
      let isSpecificFormat = false;

      if (data && typeof data === 'object' && !Array.isArray(data) && (data.clock_in !== undefined || data.status)) {
         isSpecificFormat = true;
         if (data.clock_in) {
            const t = new Date(data.clock_in);
            setFirstClockIn(t.getTime());
            setClockInDisplay(t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
            rawLogs.push({ id: t.getTime(), time: t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), rawTime: t.getTime(), type: 'CLOCK_IN', location: 'Office' });
         } else {
            setClockInDisplay('--:--');
         }

         if (data.breaks && Array.isArray(data.breaks)) {
            data.breaks.forEach((b: any, idx: number) => {
               if (b.start) rawLogs.push({ id: new Date(b.start).getTime(), time: new Date(b.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), rawTime: new Date(b.start).getTime(), type: 'BREAK_START', location: 'Office' });
               if (b.end) rawLogs.push({ id: new Date(b.end).getTime(), time: new Date(b.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), rawTime: new Date(b.end).getTime(), type: 'BREAK_END', location: 'Office' });
            });
         }

         if (data.clock_out) {
            const t = new Date(data.clock_out);
            setClockOutDisplay(t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
            rawLogs.push({ id: t.getTime(), time: t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), rawTime: t.getTime(), type: 'CLOCK_OUT', location: 'Office' });
            setStatus('IDLE');
         } else {
            setClockOutDisplay('--:--');
            if (data.is_on_break) setStatus('BREAK');
            else if (data.clock_in) setStatus('WORKING');
            else setStatus('IDLE');
         }

         if (data.total_hours) {
            setBackendTotalHours(data.total_hours);
         }
      } 
      else {
         let arr: any[] = [];
         if (Array.isArray(data)) arr = data;
         else if (data?.logs) arr = data.logs;
         
         arr.forEach((l: any, index: number) => {
             const t = l.timestamp ? new Date(l.timestamp) : new Date();
             rawLogs.push({
                 id: l.id || index,
                 time: t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                 rawTime: t.getTime(),
                 type: normalizeActionType(l.action || l.type),
                 location: l.location || 'Unknown'
             });
         });
      }

      if (rawLogs.length > 0) {
         rawLogs.sort((a, b) => b.rawTime - a.rawTime);
         setLogs(rawLogs);

         if (status === 'WORKING' || (!data?.clock_out && data?.clock_in && !data?.is_on_break)) {
             const lastActive = rawLogs.find(l => l.type === 'CLOCK_IN' || l.type === 'BREAK_END');
             if (lastActive) setStartTime(lastActive.rawTime);
         } else {
             setStartTime(null);
         }
         
         if (!isSpecificFormat) {
             const reversed = [...rawLogs].reverse();
             const first = reversed.find(l => l.type === 'CLOCK_IN');
             if (first) {
                 setFirstClockIn(first.rawTime);
                 setClockInDisplay(first.time);
             }
             const lastOut = rawLogs.find(l => l.type === 'CLOCK_OUT');
             if (lastOut) setClockOutDisplay(lastOut.time);
         }
      } else {
         setLogs([]);
         setClockInDisplay('--:--');
         setClockOutDisplay('--:--');
      }
  };

  // Calculations
  const totalWorkedMs = useMemo(() => {
     let total = 0;
     let sessionStart: number | null = null;
     const chronLogs = [...logs].reverse(); 
     chronLogs.forEach(log => {
         if (log.type === 'CLOCK_IN' || log.type === 'BREAK_END') {
             if (sessionStart === null) sessionStart = log.rawTime;
         } else if (log.type === 'BREAK_START') {
             if (sessionStart !== null) {
                 total += (log.rawTime - sessionStart);
                 sessionStart = null;
             }
         } else if (log.type === 'CLOCK_OUT') {
             if (sessionStart !== null) {
                 total += (log.rawTime - sessionStart);
                 sessionStart = null;
             }
         }
     });
     if (status === 'WORKING' && sessionStart !== null) {
         total += (now - sessionStart);
     } else if (status === 'WORKING' && sessionStart === null && startTime !== null) {
         total += (now - startTime);
     }
     return total;
  }, [logs, now, status, startTime]);

  const grossHoursMs = useMemo(() => {
    if (!firstClockIn) return 0;
    if (status === 'IDLE' && logs.length > 0 && logs[0].type === 'CLOCK_OUT') {
       return logs[0].rawTime - firstClockIn;
    }
    return now - firstClockIn;
  }, [firstClockIn, now, status, logs]);

  const currentBreakDurationMs = useMemo(() => {
    if (status !== 'BREAK') return 0;
    const lastLog = logs[0];
    if (lastLog && lastLog.type === 'BREAK_START') {
        return now - lastLog.rawTime;
    }
    return 0;
  }, [logs, now, status]);

  const wfhUsed = useMemo(() => {
      const now = new Date();
      return wfhHistory
        .filter(item => {
            const d = new Date(item.start_date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc, item) => acc + (getDaysDiff(item.start_date, item.end_date) || 0), 0);
  }, [wfhHistory]);

  const earlyLateUsed = useMemo(() => {
      const now = new Date();
      // Ensure we only count requests for the current month/year
      return earlyLateRequests(earlyLateHistory).filter(item => {
          if (!item.date) return false;
          const d = new Date(item.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
  }, [earlyLateHistory]);

  const upcomingHolidays = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      return holidays
          .filter(h => {
              const hDate = new Date(h.date);
              return hDate >= today;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4);
  }, [holidays]);

  function earlyLateRequests(history: any[]) {
      return Array.isArray(history) ? history : [];
  }

  // --- ACTIONS ---

  const handleClockIn = async () => {
    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const prevStatus = status;
    const prevLogs = [...logs];

    setStatus('WORKING');
    setStartTime(timestamp);
    if (!firstClockIn) {
        setFirstClockIn(timestamp);
        setClockInDisplay(timeStr);
    }
    
    const newLog: LogEntry = {
        id: timestamp,
        time: timeStr,
        rawTime: timestamp,
        type: 'CLOCK_IN',
        location: workLocation
    };
    setLogs(prev => [newLog, ...prev]);

    try {
        const response = await authenticatedFetch('/attendance/clock-in', {
            method: 'POST',
            body: JSON.stringify({ location: workLocation })
        });
        if (!response.ok) throw new Error("Failed");
    } catch (e) {
        alert("Clock In Failed. Reverting state.");
        setStatus(prevStatus);
        setLogs(prevLogs);
        if (!prevLogs.find(l => l.type === 'CLOCK_IN')) {
            setFirstClockIn(null);
            setClockInDisplay('--:--');
        }
        setStartTime(null);
    }
  };

  const handleClockOut = async () => {
     const timestamp = Date.now();
     const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
     const prevStatus = status;
     const prevLogs = [...logs];
     
     setStatus('IDLE');
     setStartTime(null);
     setClockOutDisplay(timeStr);
     
     const outLog: LogEntry = { 
         id: timestamp, 
         time: timeStr, 
         rawTime: timestamp,
         type: 'CLOCK_OUT', 
         location: workLocation 
     };
     setLogs(prev => [outLog, ...prev]);

     try {
         const response = await authenticatedFetch('/attendance/clock-out', {
             method: 'POST',
             body: JSON.stringify({ location: workLocation })
         });
         
         if (!response.ok) {
             const errorData = await response.json().catch(() => ({}));
             throw new Error(errorData.detail || 'Failed');
         }
         const refresh = await authenticatedFetch('/attendance/today');
         if(refresh.ok) processAttendanceData(await refresh.json());

     } catch (e) {
         alert("Failed to sync Clock Out. Reverting.");
         setStatus(prevStatus);
         setLogs(prevLogs);
         setClockOutDisplay(prevLogs.find(l => l.type === 'CLOCK_OUT')?.time || '--:--');
     }
  };

  const handleStartBreak = async () => {
    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const prevStatus = status;
    const prevLogs = [...logs];

    setStatus('BREAK');
    setStartTime(null);

    const breakLog: LogEntry = {
        id: timestamp,
        time: timeStr,
        rawTime: timestamp,
        type: 'BREAK_START',
        location: workLocation
    };
    setLogs(prev => [breakLog, ...prev]);

    try {
        const response = await authenticatedFetch('/attendance/break-start', {
            method: 'POST',
            body: JSON.stringify({ location: workLocation })
        });
        if (!response.ok) throw new Error("Failed");
    } catch (e) {
        alert("Break Start Failed. Reverting.");
        setStatus(prevStatus);
        setLogs(prevLogs);
        setStartTime(Date.now());
    }
  };

  const handleResumeWork = async () => {
    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const prevStatus = status;
    const prevLogs = [...logs];

    setStatus('WORKING');
    setStartTime(timestamp);

    const resumeLog: LogEntry = {
        id: timestamp,
        time: timeStr,
        rawTime: timestamp,
        type: 'BREAK_END',
        location: workLocation
    };
    setLogs(prev => [resumeLog, ...prev]);

    try {
        const response = await authenticatedFetch('/attendance/break-end', {
            method: 'POST',
            body: JSON.stringify({ location: workLocation })
        });
        if (!response.ok) throw new Error("Failed");
    } catch (e) {
        alert("Resume Failed. Reverting.");
        setStatus(prevStatus);
        setLogs(prevLogs);
        setStartTime(null);
    }
  };


  const formatTimeShort = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const formatTimeLong = (ms: number) => {
     if (ms < 0) ms = 0;
     const totalSeconds = Math.floor(ms / 1000);
     const seconds = totalSeconds % 60;
     const totalMinutes = Math.floor(totalSeconds / 60);
     const minutes = totalMinutes % 60;
     const hours = Math.floor(totalMinutes / 60);
     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const liveClock = new Date(now).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

  // --- FORM HANDLERS ---

  const handleLeaveSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate || !requestReason) {
        alert("Please fill in all fields (Start Date, End Date, Reason).");
        return;
    }

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffTime = end.getTime() - start.getTime();
    
    if (diffTime < 0) {
        alert("End Date cannot be before Start Date.");
        return;
    }
    
    setIsLoading(true);

    try {
        const response = await authenticatedFetch('/requests/leave', {
            method: 'POST',
            body: JSON.stringify({
                start_date: leaveStartDate,
                end_date: leaveEndDate,
                reason: requestReason,
                leave_type: leaveType,
                half_day: isHalfDay,
                half_day_type: halfDayType
            })
        });

        if (response.ok) {
            setToast({ message: 'Leave applied successfully', type: 'success' });
            setActiveModal('NONE');
            setLeaveStartDate('');
            setLeaveEndDate('');
            setLeaveType('paid');
            setRequestReason('');
            setIsHalfDay(false);
            setHalfDayType('first_half');
            await fetchLeaveBalances();
            await fetchLeaveHistory();
        } else {
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = errorData.detail || 'An error occurred while submitting the request.';
            alert(`Failed: ${errorMessage}`);
        }
    } catch (e: any) {
        alert(`Request Failed: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleWFHSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate || !requestReason) {
        alert("Please fill in all fields (Start Date, End Date, Reason).");
        return;
    }

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffTime = end.getTime() - start.getTime();
    
    if (diffTime < 0) {
        alert("End Date cannot be before Start Date.");
        return;
    }

    setIsLoading(true);

    try {
        const response = await authenticatedFetch('/requests/wfh', {
            method: 'POST',
            body: JSON.stringify({
                start_date: leaveStartDate,
                end_date: leaveEndDate,
                reason: requestReason
            })
        });

        if (response.ok) {
            setToast({ message: 'WFH Request submitted successfully', type: 'success' });
            setActiveModal('NONE');
            setLeaveStartDate('');
            setLeaveEndDate('');
            setRequestReason('');
            await fetchWfhHistory(); 
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Failed: ${errorData.detail || 'Error submitting WFH request'}`);
        }
    } catch (e: any) {
        alert(`Request Failed: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEarlyLateSubmit = async () => {
      // Basic client-side validation
      if (earlyLateUsed >= 2) {
          alert(`You have already used ${earlyLateUsed}/2 early going/late coming requests for this month.`);
          return;
      }
      
      if (!leaveStartDate || !requestReason || !earlyLateDuration) {
          alert("Please fill in date, duration and reason.");
          return;
      }

      setIsLoading(true);

      try {
          // Use authenticated fetch to call the backend
          const response = await authenticatedFetch('/requests/early-late', {
              method: 'POST',
              body: JSON.stringify({
                  date: leaveStartDate,
                  type: earlyLateType,
                  reason: requestReason,
                  duration: parseInt(earlyLateDuration.toString())
              })
          });

          if (response.ok) {
              setToast({ message: `${earlyLateType.replace('_', ' ')} request submitted successfully.`, type: 'success' });
              setActiveModal('NONE');
              setLeaveStartDate('');
              setRequestReason('');
              setEarlyLateDuration(1);
              
              // Refresh history
              await fetchEarlyLateHistory();
          } else {
              const errorData = await response.json().catch(() => ({}));
              
              // IMPORTANT: Force refresh history to sync state in case client was out of sync with server limit
              await fetchEarlyLateHistory();
              
              alert(`Failed: ${errorData.detail || 'Error submitting request'}`);
          }
      } catch (e: any) {
          await fetchEarlyLateHistory(); // Sync on error as well
          alert(`Request Failed: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };

  const handleHelpSubmit = async () => {
      if (!requestReason || !ticketSubject) {
          alert("Please fill in subject and description.");
          return;
      }
      
      setIsLoading(true);

      try {
        const response = await authenticatedFetch('/requests/help', {
            method: 'POST',
            body: JSON.stringify({
                subject: ticketSubject,
                message_body: requestReason,
                category: ticketCategory,
                recipients: [0]
            })
        });

        if (response.ok) {
            fetchHelpHistory(); // Update local history
            setToast({ message: "Help ticket raised successfully!", type: 'success' });
            setActiveModal('NONE');
            setRequestReason('');
            setTicketSubject('');
        } else {
             const errorData = await response.json().catch(() => ({}));
             alert(`Failed: ${errorData.detail || 'Error raising ticket'}`);
        }
      } catch (e: any) {
          alert(`Request Failed: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };

  const handleOpenHistory = (type: 'leave' | 'wfh' | 'help' | 'early_late') => {
    setHistoryType(type);
    setViewMode('history');
    if(type === 'leave') fetchLeaveHistory();
    else if(type === 'wfh') fetchWfhHistory();
    else if(type === 'early_late') fetchEarlyLateHistory();
    else fetchHelpHistory();
  };

  // --- Modal Forms ---
  const renderCommonForm = (title: string, buttonText: string) => (
      <div className="space-y-4">
         <p className="text-sm text-zinc-500">Please fill in the details for {title}.</p>
         <textarea 
            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none resize-none h-24" 
            placeholder="Reason / Description..." 
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
         />
         <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md">{buttonText}</button>
      </div>
  );

  const renderEarlyLateForm = () => (
      <div className="space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl flex justify-between items-center">
              <div>
                  <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Monthly Limit</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Max 2 requests allowed per month</p>
              </div>
              <div className="text-right">
                  <span className={`text-xl font-bold ${earlyLateUsed >= 2 ? 'text-red-500' : 'text-indigo-700 dark:text-indigo-300'}`}>
                      {earlyLateUsed}/2
                  </span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Date</label>
                  <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input 
                          type="date" 
                          value={leaveStartDate} 
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Type</label>
                  <select 
                      value={earlyLateType}
                      onChange={(e) => setEarlyLateType(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                  >
                      <option value="early_going">Early Going</option>
                      <option value="late_coming">Late Coming</option>
                  </select>
              </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Duration (Hours)</label>
              <div className="relative">
                  <IconClock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input 
                      type="number" 
                      min="1"
                      max="4"
                      value={earlyLateDuration}
                      onChange={(e) => setEarlyLateDuration(parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
              </div>
          </div>

           <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Reason</label>
              <textarea 
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none resize-none h-24" 
                  placeholder="Reason for early/late..." 
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
              />
           </div>

           <button 
              onClick={handleEarlyLateSubmit}
              disabled={earlyLateUsed >= 2 || isLoading}
              className={`w-full py-2.5 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2 ${
                  earlyLateUsed >= 2 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
          >
              {isLoading ? 'Submitting...' : (earlyLateUsed >= 2 ? 'Limit Reached' : 'Submit Request')}
          </button>
      </div>
  );

  const renderHelpForm = () => (
      <div className="space-y-4">
          <div className="flex justify-end">
              <button 
                  onClick={() => { setActiveModal('NONE'); handleOpenHistory('help'); }}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
              >
                  <IconHistory className="w-3 h-3" /> View Ticket History
              </button>
          </div>

          <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Subject</label>
              <input 
                  type="text" 
                  value={ticketSubject} 
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Brief subject..."
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Category</label>
                  <select 
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                  >
                      <option value="IT Support">IT Support</option>
                      <option value="HR Query">HR Query</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Admin/Facilities">Admin/Facilities</option>
                      <option value="Other">Other</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Priority</label>
                  <select 
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                  >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                  </select>
              </div>
          </div>

           <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Description</label>
              <textarea 
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none resize-none h-32" 
                  placeholder="Describe your issue in detail..." 
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
              />
           </div>

           <button 
              onClick={handleHelpSubmit}
              disabled={isLoading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2"
           >
              {isLoading ? (
                  <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span>Submitting...</span>
                  </>
              ) : (
                  'Raise Ticket'
              )}
           </button>
      </div>
  );

  const renderWFHForm = () => (
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Start Date</label>
                  <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input 
                          type="date" 
                          value={leaveStartDate} 
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">End Date</label>
                  <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input 
                          type="date" 
                          value={leaveEndDate} 
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                      />
                  </div>
              </div>
          </div>

           <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Reason</label>
              <textarea 
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none resize-none h-24" 
                  placeholder="Describe the reason for WFH..." 
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
              />
           </div>

           <button 
              onClick={handleWFHSubmit} 
              disabled={isLoading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2"
          >
              {isLoading ? (
                  <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span>Submitting...</span>
                  </>
              ) : (
                  'Submit WFH Request'
              )}
          </button>
      </div>
  );

  const renderLeaveForm = () => {
    let daysCount = 0;
    if(leaveStartDate && leaveEndDate) {
        const start = new Date(leaveStartDate);
        const end = new Date(leaveEndDate);
        if(!isNaN(start.getTime()) && !isNaN(end.getTime())) {
             const diffTime = end.getTime() - start.getTime();
             daysCount = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
        }
    }
    
    if (isHalfDay) daysCount = 0.5;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Start Date</label>
                    <div className="relative">
                        <IconCalendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <input 
                            type="date" 
                            value={leaveStartDate} 
                            onChange={(e) => setLeaveStartDate(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">End Date</label>
                    <div className="relative">
                        <IconCalendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <input 
                            type="date" 
                            value={leaveEndDate} 
                            onChange={(e) => setLeaveEndDate(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Half Day Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Half Day Request</span>
                    <span className="text-xs text-zinc-500">Apply for a partial day leave</span>
                </div>
                <button 
                    onClick={() => setIsHalfDay(!isHalfDay)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isHalfDay ? 'bg-cyan-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${isHalfDay ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Half Day Type Selection */}
            {isHalfDay && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                    <button 
                        onClick={() => setHalfDayType('first_half')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            halfDayType === 'first_half' 
                            ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-400' 
                            : 'bg-white dark:bg-black/20 border-zinc-200 dark:border-white/10 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5'
                        }`}
                    >
                        First Half
                    </button>
                    <button 
                        onClick={() => setHalfDayType('second_half')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            halfDayType === 'second_half' 
                            ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-400' 
                            : 'bg-white dark:bg-black/20 border-zinc-200 dark:border-white/10 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5'
                        }`}
                    >
                        Second Half
                    </button>
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Leave Type</label>
                <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                >
                    <option value="paid">Paid Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                </select>
            </div>

             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Reason</label>
                <textarea 
                    className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none resize-none h-24" 
                    placeholder="Describe the reason for leave..." 
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                />
             </div>

             {daysCount > 0 && (
                 <div className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-100 dark:border-cyan-800/30">
                     <span className="text-sm text-cyan-800 dark:text-cyan-200 font-medium">Total Duration</span>
                     <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">{daysCount} Days</span>
                 </div>
             )}

             <button 
                onClick={handleLeaveSubmit} 
                disabled={isLoading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2"
            >
                {isLoading ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Submitting...</span>
                    </>
                ) : (
                    'Submit Leave Request'
                )}
            </button>
        </div>
    );
  };

  const renderCalendarModal = () => (
      <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Complete list of corporate holidays for the current year.</p>
          <div className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs">
                      <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Occasion</th>
                          <th className="px-4 py-3">Type</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {holidays.length === 0 ? (
                          <tr><td colSpan={3} className="p-4 text-center text-zinc-400">No holidays found.</td></tr>
                      ) : (
                          holidays.map((h, i) => (
                              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                                  <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                                      {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-zinc-800 dark:text-white">{h.occasion}</td>
                                  <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${h.type.toLowerCase().includes('national') ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {h.type}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case 'APPLY_LEAVE': return renderLeaveForm();
      case 'WFH': return renderWFHForm();
      case 'EARLY_LATE': return renderEarlyLateForm();
      case 'HELP': return renderHelpForm();
      case 'CALENDAR': return renderCalendarModal();
      default: return null;
    }
  };

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = total > 0 ? (remaining / total) * 100 : 0;
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (viewMode === 'history') {
      return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <IconChevronLeft className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Request History</h1>
                        <div className="flex gap-4 mt-2">
                            <button 
                                onClick={() => handleOpenHistory('leave')} 
                                className={`text-sm font-bold border-b-2 pb-1 transition-colors ${historyType === 'leave' ? 'text-cyan-600 border-cyan-600 dark:text-cyan-400 dark:border-cyan-400' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                            >
                                Leave Requests
                            </button>
                            <button 
                                onClick={() => handleOpenHistory('wfh')} 
                                className={`text-sm font-bold border-b-2 pb-1 transition-colors ${historyType === 'wfh' ? 'text-cyan-600 border-cyan-600 dark:text-cyan-400 dark:border-cyan-400' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                            >
                                WFH Requests
                            </button>
                            <button 
                                onClick={() => handleOpenHistory('early_late')} 
                                className={`text-sm font-bold border-b-2 pb-1 transition-colors ${historyType === 'early_late' ? 'text-cyan-600 border-cyan-600 dark:text-cyan-400 dark:border-cyan-400' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                            >
                                Early/Late
                            </button>
                            <button 
                                onClick={() => handleOpenHistory('help')} 
                                className={`text-sm font-bold border-b-2 pb-1 transition-colors ${historyType === 'help' ? 'text-cyan-600 border-cyan-600 dark:text-cyan-400 dark:border-cyan-400' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                            >
                                Help Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            {historyType === 'leave' && <th className="px-6 py-4">Leave Type</th>}
                            {historyType === 'early_late' && <th className="px-6 py-4">Type</th>}
                            {historyType !== 'help' && <th className="px-6 py-4">Duration</th>}
                            <th className="px-6 py-4">{historyType === 'help' ? 'Details' : 'Reason'}</th>
                            {historyType === 'help' && <th className="px-6 py-4">Status</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {historyType === 'leave' ? (
                            leaveHistory.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-zinc-400 italic">No leave history found.</td></tr>
                            ) : (
                                leaveHistory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{new Date(item.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                                {item.start_date !== item.end_date && (
                                                    <span className="text-xs text-zinc-400 mt-0.5">to {new Date(item.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                                item.leave_type?.toLowerCase().includes('paid')
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                : item.leave_type?.toLowerCase().includes('sick')
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
                                            }`}>
                                                {item.leave_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono">
                                            {item.days} Day{item.days !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={item.reason}>
                                            {item.reason}
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : historyType === 'wfh' ? (
                            wfhHistory.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-zinc-400 italic">No WFH history found.</td></tr>
                            ) : (
                                wfhHistory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{new Date(item.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                                {item.start_date !== item.end_date && (
                                                    <span className="text-xs text-zinc-400 mt-0.5">to {new Date(item.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono">
                                            {getDaysDiff(item.start_date, item.end_date)} Day(s)
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={item.reason}>
                                            {item.reason}
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : historyType === 'early_late' ? (
                            earlyLateHistory.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-zinc-400 italic">No early/late requests found.</td></tr>
                            ) : (
                                earlyLateHistory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                                            {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'early_going' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {item.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono">
                                            {item.duration || 1} Hr(s)
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={item.reason}>
                                            {item.reason}
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            helpHistory.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-zinc-400 italic">No help tickets found.</td></tr>
                            ) : (
                                helpHistory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            <p className="font-bold text-zinc-800 dark:text-white truncate max-w-md">{item.title}</p>
                                            <p className="text-xs text-zinc-500 truncate max-w-md">{item.details}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
           <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-zinc-900 dark:border-emerald-500/30' : 'bg-red-50 border-red-200 dark:bg-zinc-900 dark:border-red-500/30'
           }`}>
              <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                 {toast.type === 'success' ? <IconCheckCircle className="w-5 h-5" /> : <IconAlertCircle className="w-5 h-5" />}
              </div>
              <div>
                 <p className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                    {toast.type === 'success' ? 'Success' : 'Error'}
                 </p>
                 <p className="text-xs text-zinc-600 dark:text-zinc-400">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                 <IconX className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      <Modal title={activeModal === 'CALENDAR' ? 'Corporate Holiday Calendar' : activeModal.replace('_', ' ')} isOpen={activeModal !== 'NONE'} onClose={() => setActiveModal('NONE')}>
        {renderModalContent()}
      </Modal>

      {/* Greeting Header */}
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">{currentDate}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Time & Attendance */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Clock Card */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm relative overflow-hidden transition-all">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">Attendance</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{workLocation}</p>
                </div>
                <div className="text-right">
                   <div className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{liveClock}</div>
                </div>
              </div>

              {/* Main Timer (Effective Hours) */}
              <div className="text-center py-6 relative z-10">
                  <div className={`text-5xl font-bold tabular-nums tracking-tight font-mono transition-colors ${status === 'BREAK' ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-white'}`}>
                      {formatTimeLong(totalWorkedMs)}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">Effective Hours</p>
                  
                  {/* Gross Hours (Keka Style) */}
                  <div className="mt-2 text-xs text-zinc-400">
                     Gross Hours: <span className="font-mono font-medium">{formatTimeShort(grossHoursMs)}</span>
                  </div>
                  
                  {/* Break Timer - Only visible when on break */}
                  {status === 'BREAK' && (
                     <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                           <p className="text-xl font-bold text-amber-600 dark:text-amber-500 font-mono">{formatTimeLong(currentBreakDurationMs)}</p>
                           <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 uppercase tracking-widest">On Break</p>
                        </div>
                     </div>
                  )}

                  {/* Explicit Clock In/Out Times */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-white/5">
                      <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Clock In</p>
                          <p className="text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">{clockInDisplay}</p>
                      </div>
                      <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Clock Out</p>
                          <p className="text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">{clockOutDisplay}</p>
                      </div>
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 px-2 relative z-10">
                  <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 font-medium">Daily Progress</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                        {status === 'IDLE' && backendTotalHours ? backendTotalHours : formatTimeShort(totalWorkedMs)} / 09h 00m
                      </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 dark:bg-black/40 rounded-full overflow-hidden border border-zinc-200 dark:border-white/5">
                      <div 
                         className={`h-full rounded-full transition-all duration-1000 ${status === 'WORKING' ? 'bg-cyan-500 animate-pulse' : status === 'BREAK' ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                         style={{ width: `${Math.min((totalWorkedMs / (9 * 60 * 60 * 1000)) * 100, 100)}%` }}
                      ></div>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 relative z-10 mt-6">
                  {/* Clock In Button */}
                  <button 
                      onClick={handleClockIn} 
                      disabled={isLoading || status !== 'IDLE'} 
                      className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all
                          ${status === 'IDLE' 
                              ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 shadow-sm transform hover:-translate-y-0.5' 
                              : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-white/5 text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                          }
                      `}
                  >
                      <IconMapPin className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wide">Clock In</span>
                  </button>

                  {/* Break/Resume Button */}
                  <button 
                      onClick={status === 'BREAK' ? handleResumeWork : handleStartBreak} 
                      disabled={isLoading || status === 'IDLE'} 
                      className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all
                          ${status === 'WORKING'
                              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 shadow-sm transform hover:-translate-y-0.5'
                              : status === 'BREAK'
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 shadow-sm animate-pulse'
                                  : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-white/5 text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                          }
                      `}
                  >
                      {status === 'BREAK' ? <IconPlay className="w-6 h-6" /> : <IconCoffee className="w-6 h-6" />}
                      <span className="text-xs font-bold uppercase tracking-wide">{status === 'BREAK' ? 'Resume' : 'Break'}</span>
                  </button>

                  {/* Clock Out Button */}
                  <button 
                      onClick={handleClockOut} 
                      disabled={isLoading || status === 'IDLE'} 
                      className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all
                          ${status !== 'IDLE'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-sm transform hover:-translate-y-0.5'
                              : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-white/5 text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                          }
                      `}
                  >
                      <IconStopCircle className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wide">Clock Out</span>
                  </button>
              </div>

              {/* Location Selector (Only when IDLE) */}
              {status === 'IDLE' && (
                  <div className="flex justify-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2">
                      <button onClick={() => setWorkLocation('Office')} className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-all ${workLocation === 'Office' ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-white/10 hover:border-cyan-500 hover:text-cyan-500'}`}>
                          <IconBriefcase className="w-3 h-3" /> Office
                      </button>
                      <button onClick={() => setWorkLocation('Home')} className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-all ${workLocation === 'Home' ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-white/10 hover:border-cyan-500 hover:text-cyan-500'}`}>
                          <IconHome className="w-3 h-3" /> Work From Home
                      </button>
                  </div>
              )}
              
              {status !== 'IDLE' && (
                  <div className="mt-6 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'BREAK' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                         <span className="relative flex h-2 w-2">
                           <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'BREAK' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                           <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'BREAK' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                         </span>
                         {status === 'BREAK' ? 'On Break' : 'Currently Working'}
                      </span>
                  </div>
              )}
           </div>

           {/* Logs / Timeline */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">Logs</h3>
                     {(totalWorkedMs > 0 || backendTotalHours) && logsViewMode === 'today' && (
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded">
                           {backendTotalHours && status === 'IDLE' ? backendTotalHours : formatTimeShort(totalWorkedMs)}
                        </span>
                     )}
                  </div>
                  
                  <div className="flex p-0.5 bg-zinc-100 dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-white/5">
                    <button 
                        onClick={() => setLogsViewMode('today')}
                        className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${logsViewMode === 'today' ? 'bg-white dark:bg-zinc-800 shadow-sm text-cyan-700 dark:text-cyan-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => { setLogsViewMode('history'); fetchAttendanceHistory(); }}
                        className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${logsViewMode === 'history' ? 'bg-white dark:bg-zinc-800 shadow-sm text-cyan-700 dark:text-cyan-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Monthly
                    </button>
                  </div>
              </div>
              
              {logsViewMode === 'today' ? (
                  <div className="relative pl-4 border-l-2 border-zinc-100 dark:border-white/5 space-y-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                     {logs.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic pl-2">No activity recorded today.</p>
                     ) : (
                        logs.map((log) => (
                           <div key={log.id} className="relative pl-4 group">
                              <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-black ${
                                  log.type === 'CLOCK_IN' ? 'bg-emerald-500' : 
                                  log.type === 'BREAK_START' ? 'bg-amber-500' :
                                  log.type === 'BREAK_END' ? 'bg-blue-500' :
                                  'bg-red-500'
                              }`}></div>
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-white">
                                        {log.type === 'CLOCK_IN' ? 'Clocked In' : 
                                         log.type === 'BREAK_START' ? 'Started Break' :
                                         log.type === 'BREAK_END' ? 'Resumed Work' :
                                         'Clocked Out'}
                                    </p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><IconMapPin className="w-3 h-3" /> {log.location}</p>
                                 </div>
                                 <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-50 dark:bg-white/5 px-1.5 py-0.5 rounded">{log.time}</span>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
              ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {attendanceHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-xs text-zinc-400 italic">No history records found for this month.</p>
                        </div>
                    ) : (
                        attendanceHistory.map((record, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors group">
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' })}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                                        Total: {record.total_hours || '0h 0m'}
                                    </p>
                                </div>
                                <div className="flex gap-4 text-right">
                                    <div>
                                        <p className="text-[10px] uppercase text-zinc-400 font-bold">In</p>
                                        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                            {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-zinc-400 font-bold">Out</p>
                                        <p className="text-xs font-mono text-red-500 dark:text-red-400 font-medium">
                                            {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                  </div>
              )}
           </div>
        </div>

        {/* MIDDLE COLUMN: Quick Actions & Dashboard Widgets */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Quick Actions Grid */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                 <button onClick={() => setActiveModal('APPLY_LEAVE')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <IconSun className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Leave</span>
                 </button>
                 <button onClick={() => setActiveModal('WFH')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <IconHome className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Apply WFH</span>
                 </button>
                 <button onClick={() => setActiveModal('EARLY_LATE')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <IconClock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 text-center leading-tight">Early/Late</span>
                 </button>
                 <button onClick={() => setActiveModal('HELP')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <IconMessage className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Help Desk</span>
                 </button>
              </div>
           </div>

           {/* Social Hub (Keka Feature) */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><IconSparkles className="w-16 h-16 text-amber-500" /></div>
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide mb-4">What's Happening</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Sarah Jenkins', type: 'Work Anniversary', date: 'Today', years: '3 Years', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                   { name: 'Michael Chen', type: 'Birthday', date: 'Tomorrow', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
                 ].map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                       <img src={event.avatar} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-white/10" alt="" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{event.name}</p>
                          <p className="text-[10px] text-zinc-500 font-medium uppercase">{event.type} {event.years ? `• ${event.years}` : ''}</p>
                       </div>
                       <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">{event.date}</span>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 py-2 text-xs font-bold text-cyan-600 hover:underline">View Community Hub</button>
           </div>

           {/* Leave Balance Mini - Dynamic from API */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">Leave Balances</h3>
                 <button onClick={() => handleOpenHistory('leave')} className="text-[10px] flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                    <IconHistory className="w-3 h-3" /> History
                 </button>
              </div>
              <div className="space-y-4">
                 {!Array.isArray(leaveBalances) || leaveBalances.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No balance data available.</p>
                 ) : (
                    leaveBalances.map((bal) => (
                       <div key={bal.leave_type}>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-zinc-600 dark:text-zinc-400 font-medium capitalize">{bal.leave_type}</span>
                             <span className="font-bold text-zinc-800 dark:text-white">{bal.remaining_days} / {bal.total_days}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(bal.remaining_days, bal.total_days)}`} 
                                style={{ width: `${bal.total_days > 0 ? (bal.remaining_days / bal.total_days) * 100 : 0}%` }}
                             ></div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Team & Holidays */}
        <div className="lg:col-span-1 space-y-6">
           {/* Who is on Leave */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide mb-4">Who's Off Today</h3>
              <div className="mb-4">
                 <CalendarWidget selectedDate={selectedDate} onDateSelect={setSelectedDate} events={leaves} />
              </div>
              <div className="p-4 text-center text-zinc-400 text-sm italic">
                 Everyone is working today.
              </div>
           </div>

           {/* Upcoming Holidays Widget */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">Upcoming Holidays</h3>
                 <button onClick={() => setActiveModal('CALENDAR')} className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline">View Calendar</button>
              </div>
              <div className="space-y-4">
                 {upcomingHolidays.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic text-center py-4">No upcoming holidays found.</p>
                 ) : (
                    upcomingHolidays.map((h, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                           <div className="flex flex-col items-center justify-center w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/30 group-hover:scale-105 transition-transform">
                              <span className="text-[10px] font-bold uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-lg font-bold leading-none">{new Date(h.date).getDate()}</span>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{h.occasion}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${h.type.toLowerCase().includes('national') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                  {h.type}
                              </span>
                           </div>
                        </div>
                    ))
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomeView;
