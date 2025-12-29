
import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconSearch, IconPlus, IconTrash, IconFileEdit, IconCheckCircle, IconXCircle, 
  IconShield, IconUsers, IconChevronLeft, IconChevronRight, IconKey, IconUserCheck, IconBriefcase,
  IconWallet, IconFileText, IconHistory, IconMapPin, IconMail, IconSmartphone, IconX, IconLock, IconSparkles,
  IconClock, IconSun, IconStopCircle, IconHome, IconMessage, IconAlertCircle, IconLaptop, IconCash, IconDownload,
  IconEye, IconCalendar, IconBulb, IconPrinter, IconSend, IconMonitor
} from './Icons';
import { authenticatedFetch, formatCurrency } from '../constants';

// Valid statuses strictly matching backend validation
const VALID_STATUSES = [
  { value: "active", label: "Active" },
  { value: "full_time", label: "Full Time" },
  { value: "in-probation", label: "In Probation" },
  { value: "notice-period", label: "Notice Period" },
  { value: "trainee", label: "Trainee" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" }
];

interface Employee {
  id: string;
  employeeId: string; 
  name: string;
  role: string;
  department: string;
  salary: number;
  email: string;
  status: string;
  avatar: string;
  joinDate: string; 
  rawJoinDate: string; 
  location: string;
  manager: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  address?: string;
  personalEmail?: string;
  mobile?: string;
  manager_id?: number | null;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  serial: string;
  assignedDate: string;
}

interface Doc {
  id: number;
  name: string;
  status: 'Verified' | 'Pending';
  date: string;
}

interface LeaveBalance {
  total_leaves: number;
  leaves_left: number;
  used_leaves: number;
}

interface DailyStatus {
    status: 'In' | 'Out' | 'Leave' | 'WFH' | 'Not In Yet';
    time?: string;
    location?: string;
}

interface FinanceOverview {
  salary: {
    annualCTC: number;
    monthlyGross: number;
    basic: number;
    hra: number;
    specialAllowance: number;
    pfDeduction: number;
    taxDeduction: number;
    totalDeductions: number;
    netPay: number;
    currency: string;
  };
  payCycle: {
    lastPaid: string;
    nextPayDate: string;
    daysToPay: number;
    nextIncrementDate: string;
    incrementCycle: string;
  };
  payslips: Array<{
    id: number;
    month: string | number;
    year: number;
    amount: number;
    status: string;
  }>;
}

interface CheckProcessingStatusResponse {
  employee_id: number;
  month: number;
  year: number;
  has_paid_payslip: boolean;
  payslip_id: number | null;
  payslip_amount: number | null;
  payslip_status: string | null;
  processed_date: string | null;
  monthly_processing_record_exists: boolean;
  monthly_processing_id: number | null;
  employee_name: string;
  employee_email: string;
}

interface SalaryProcessResponse {
  success: boolean;
  message: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  month: number;
  year: number;
  amount_processed: number;
  status: string;
  processed_date: string;
  payslip_id: number;
  monthly_processing_id: number;
  duplicate_prevented: boolean;
  payslip_details: {
    basic: number;
    hra: number;
    special_allowance: number;
    total_deductions: number;
    net_pay: number;
  };
}

interface BulkProcessResponse {
  success: boolean;
  message: string;
  total_employees: number;
  processed_count: number;
  failed_count: number;
  skipped_count: number;
  processed_employees: any[];
  failed_employees: any[];
  skipped_employees: any[];
  month: number;
  year: number;
  total_amount_processed: number;
  processed_at: string;
}

interface TransferLog {
  employee_id: number;
  email: string;
  amount_paid: number;
  status: string;
}

interface MonthlySalaryLogResponse {
  success: boolean;
  month: number;
  year: number;
  employees: TransferLog[];
  generated_at: string;
}

interface CtcBreakdown {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  annual_ctc: number;
  monthly_gross: number;
  basic: number;
  hra: number;
  special_allowance: number;
  pf_deduction: number;
  tax_deduction: number;
  professional_tax: number;
  total_deductions: number;
  net_pay: number;
  employer_pf: number;
  cost_per_day: number;
  calculation_details: {
    basic_percentage: number;
    hra_percentage: number;
    professional_tax_calculation: string;
    cost_per_day_calculation: string;
    employer_pf_calculation: string;
    last_calculated: string;
  };
  last_updated: string;
}

interface MonthlySalaryValidation {
  success: boolean;
  employee_id: number;
  employee_name: string;
  month: number;
  year: number;
  is_valid: boolean;
  validation_issues: string[];
  days_in_month: number;
  working_days: number;
  unpaid_leave_days: number;
  half_day_leaves: number;
  payable_days: number;
  daily_salary: number;
  leave_deduction: number;
  custom_deduction: number;
  total_deductions: number;
  final_net_salary: number;
  payslip_id: number | null;
  payslip_generated: boolean;
  calculation_details: any;
  processed_at: string;
}

interface PayslipResponse {
  success: boolean;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  payslip_id: number;
  month: number;
  year: number;
  pay_date: string;
  annual_ctc: number;
  monthly_ctc: number;
  basic_actual: number;
  basic_payable: number;
  hra_actual: number;
  hra_payable: number;
  special_allowance_actual: number;
  special_allowance_payable: number;
  total_earnings_actual: number;
  total_earnings_payable: number;
  pf_deduction: number;
  tax_deduction: number;
  professional_tax: number;
  leave_deduction: number;
  other_deductions: number;
  total_deductions: number;
  gross_salary: number;
  in_hand_salary: number;
  total_days_in_month: number;
  total_working_days: number;
  unpaid_leaves_taken: number;
  half_day_leaves: number;
  per_day_salary: number;
  salary_cut_for_unpaid_leaves: number;
  final_processed_salary: number;
  ytd_earnings: number;
  ytd_deductions: number;
  leave_balance_remaining: number;
  generated_at: string;
  calculation_details: any;
}

// Helper to convert number to words
const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const s = n.toString();
    return b[parseInt(s[0])] + (s[1] !== '0' ? ' ' + a[parseInt(s[1])] : '');
  };

  const amount = Math.floor(num);
  if (amount === 0) return 'Zero';

  let result = '';
  if (amount >= 1000) {
    result += inWords(Math.floor(amount / 1000)) + ' Thousand ';
  }
  const rem = amount % 1000;
  if (rem >= 100) {
    result += inWords(Math.floor(rem / 100)) + ' Hundred ';
    if (rem % 100 > 0) result += 'and ';
  }
  if (rem % 100 > 0) {
    result += inWords(rem % 100);
  }

  return result.trim() + ' Rupees only';
};

// --- NEW ENHANCED STATUS MODAL (Success/Failure) ---
const DisbursementStatusModal = ({ 
  isOpen, 
  onClose, 
  data, 
  status = 'success',
  errorMsg = '' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: SalaryProcessResponse | null;
  status?: 'success' | 'error';
  errorMsg?: string;
}) => {
  if (!isOpen) return null;

  const isSuccess = status === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`
        relative w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500 transform
        ${isSuccess ? 'bg-gradient-to-br from-emerald-600 to-teal-800 animate-in zoom-in-95' : 'bg-gradient-to-br from-rose-600 to-red-900 border border-red-500/40 animate-[shake_0.5s_ease-in-out_infinite_alternate]'}
        flex flex-col items-center p-10 text-white
      `}>
        
        <style>{`
          @keyframes dash { to { stroke-dashoffset: 0; } }
          @keyframes shake { 0% { transform: translateX(-4px); } 100% { transform: translateX(4px); } }
          @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.4); opacity: 0; } }
        `}</style>

        {/* Animated Background Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
           <div className={`absolute top-10 left-10 w-2 h-2 rounded-full animate-ping duration-[3s] ${isSuccess ? 'bg-emerald-300' : 'bg-rose-300'}`}></div>
           <div className={`absolute bottom-20 right-12 w-2 h-2 rounded-full animate-ping duration-[2s] delay-300 ${isSuccess ? 'bg-white' : 'bg-orange-300'}`}></div>
           <div className={`absolute top-1/2 right-10 w-1.5 h-1.5 rounded-full animate-ping duration-[4s] delay-700 ${isSuccess ? 'bg-teal-200' : 'bg-red-200'}`}></div>
           <div className={`absolute top-1/3 left-1/4 w-3 h-3 rounded-full blur-xl animate-pulse ${isSuccess ? 'bg-emerald-400/30' : 'bg-red-400/30'}`}></div>
        </div>

        {/* Status Icon Animation */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Animated Rings */}
          <div className={`absolute inset-0 rounded-full animate-[pulse-ring_2s_infinite] border-4 ${isSuccess ? 'border-emerald-400/30' : 'border-rose-400/30'}`}></div>
          <div className={`absolute inset-0 rounded-full animate-[pulse-ring_2s_infinite_1s] border-4 ${isSuccess ? 'border-emerald-400/20' : 'border-rose-400/20'}`}></div>
          
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-500 delay-200 bg-white">
              {isSuccess ? (
                <svg className="w-14 h-14 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_0.6s_ease-in-out_forwards]" style={{ strokeDasharray: 24, strokeDashoffset: 24 }} />
                </svg>
              ) : (
                <svg className="w-14 h-14 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" className="animate-[dash_0.6s_ease-in-out_forwards]" style={{ strokeDasharray: 30, strokeDashoffset: 30 }} />
                </svg>
              )}
          </div>
        </div>

        <div className="text-center space-y-1 mb-8 relative z-10">
           <h2 className="text-3xl font-black tracking-tight leading-none drop-shadow-md">
             {isSuccess ? (data?.duplicate_prevented ? 'Payment Recorded' : 'Disbursed!') : 'Action Required'}
           </h2>
           <p className="text-white/80 text-sm font-medium mt-2 uppercase tracking-widest text-[10px]">
             {isSuccess ? `Transaction Confirmed` : 'Transaction Aborted'}
           </p>
        </div>

        {isSuccess && data ? (
          <>
            <div className="flex flex-col items-center mb-10 relative z-10 scale-110">
                <div className="text-6xl font-black tracking-tighter flex items-start">
                   <span className="text-2xl mt-2 mr-1 font-bold opacity-70">₹</span>
                   {data.amount_processed.toLocaleString('en-IN')}
                </div>
                <div className="mt-4 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                   TXN-{data.monthly_processing_id}{data.payslip_id}
                </div>
            </div>

            <div className="w-full space-y-4 bg-white/10 p-6 rounded-3xl border border-white/10 relative z-10">
               <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70 font-bold uppercase tracking-widest text-[9px]">Employee</span>
                  <span className="font-black text-sm">{data.employee_name}</span>
               </div>
               <div className="h-px bg-white/10 w-full"></div>
               <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70 font-bold uppercase tracking-widest text-[9px]">Period</span>
                  <span className="font-black text-sm">{new Date(2000, data.month - 1).toLocaleString('default', { month: 'short' })} {data.year}</span>
               </div>
            </div>
          </>
        ) : (
          <div className="w-full bg-black/30 p-8 rounded-3xl border border-white/10 text-center relative z-10 mb-8">
             <div className="mb-4 inline-flex items-center justify-center p-2 bg-white/10 rounded-lg">
                <IconAlertCircle className="w-6 h-6 text-white" />
             </div>
             <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Error Detail</p>
             <p className="text-lg font-black text-white leading-tight uppercase">
                {errorMsg.toLowerCase().includes('already') ? 'Salary Already Credited' : 'Process Failed'}
             </p>
             <p className="text-xs text-white/70 mt-2 leading-relaxed">
                {errorMsg || "The payroll gateway declined the connection. Please check the employee's bank details or try again after some time."}
             </p>
          </div>
        )}

        <button 
          onClick={onClose}
          className={`
            mt-6 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 transform
            ${isSuccess ? 'bg-white text-emerald-800 hover:bg-emerald-50' : 'bg-white text-red-800 hover:bg-rose-50'}
          `}
        >
          {isSuccess ? 'Continue' : 'Close and Review'}
        </button>
      </div>
    </div>
  );
};

// --- BULK DISBURSEMENT RESULT MODAL ---
const BulkDisbursementStatusModal = ({ 
  isOpen, 
  onClose, 
  data 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: BulkProcessResponse | null;
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`
        relative w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b] flex flex-col items-center p-10 text-white animate-in zoom-in-95 duration-500
      `}>
        
        <style>{`
          @keyframes dash { to { stroke-dashoffset: 0; } }
          @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.4); opacity: 0; } }
        `}</style>

        {/* Animated Background Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
           <div className={`absolute top-10 left-10 w-2 h-2 rounded-full animate-ping duration-[3s] bg-purple-300`}></div>
           <div className={`absolute bottom-20 right-12 w-2 h-2 rounded-full animate-ping duration-[2s] delay-300 bg-white`}></div>
           <div className={`absolute top-1/3 left-1/4 w-3 h-3 rounded-full blur-xl animate-pulse bg-purple-400/30`}></div>
        </div>

        {/* Status Icon */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-[pulse-ring_2s_infinite] border-4 border-purple-400/30"></div>
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl bg-white">
              <svg className="w-14 h-14 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_0.6s_ease-in-out_forwards]" style={{ strokeDasharray: 24, strokeDashoffset: 24 }} />
              </svg>
          </div>
        </div>

        <div className="text-center space-y-1 mb-8 relative z-10">
           <h2 className="text-3xl font-black tracking-tight leading-none">Batch Disbursed!</h2>
           <p className="text-white/80 text-sm font-medium mt-2 uppercase tracking-widest text-[10px]">
             Payroll Execution Complete for {new Date(2000, data.month - 1).toLocaleString('default', { month: 'long' })} {data.year}
           </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Target</p>
                <p className="text-xl font-black">{data.total_employees}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md p-4 rounded-3xl border border-emerald-500/20 text-center">
                <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Processed</p>
                <p className="text-xl font-black text-emerald-400">{data.processed_count}</p>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-md p-4 rounded-3xl border border-amber-500/20 text-center">
                <p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mb-1">Fail/Skip</p>
                <p className="text-xl font-black text-emerald-400">{data.failed_count + data.skipped_count}</p>
            </div>
        </div>

        <div className="w-full space-y-4 bg-white/10 p-6 rounded-3xl border border-white/10 relative z-10 mb-8">
            <div className="flex justify-between items-center text-xs">
                <span className="opacity-70 font-bold uppercase tracking-widest text-[9px]">Total Batch Value</span>
                <span className="font-black text-lg">{formatCurrency(data.total_amount_processed)}</span>
            </div>
            {data.failed_employees.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Action Items: {data.failed_count} Failed Transfers</p>
                </div>
            )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 transform bg-white text-purple-900 hover:bg-purple-50"
        >
          View Audit Log
        </button>
      </div>
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, isOpen, onClose, children, maxWidth = "max-w-lg" }: { title: string; isOpen: boolean; onClose: () => void; children?: React.ReactNode; maxWidth?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full ${maxWidth} shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}>
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-white/5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
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

// Success Overlay for basic updates
const SuccessOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 transform scale-100">
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-50/20 flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Success!</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center">{message}</p>
    </div>
  </div>
);

const AdminView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sub-data for detailed view
  const [assets, setAssets] = useState<Asset[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview | null>(null);
  const [ctcBreakdown, setCtcBreakdown] = useState<CtcBreakdown | null>(null);
  const [monthlyValidation, setMonthlyValidation] = useState<MonthlySalaryValidation | null>(null);
  const [generatedPayslip, setGeneratedPayslip] = useState<PayslipResponse | null>(null);
  const [processResult, setProcessResult] = useState<SalaryProcessResponse | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkProcessResponse | null>(null);
  const [checkStatus, setCheckStatus] = useState<CheckProcessingStatusResponse | null>(null);
  
  // Salary Transfer Logs State
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsData, setLogsData] = useState<TransferLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsYear, setLogsYear] = useState<number>(new Date().getFullYear());
  const [logsMonth, setLogsMonth] = useState<number>(new Date().getMonth() + 1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdateValue, setStatusUpdateValue] = useState('');
  
  // Date selection for Monthly Processing
  const [processMonth, setProcessMonth] = useState<number>(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState<number>(new Date().getFullYear());

  // View State Management
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [isProcessingMonthly, setIsProcessingMonthly] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Profile' | 'Job' | 'Documents' | 'Assets' | 'History' | 'Finance'>('Overview');
  const [financeSubView, setFinanceSubView] = useState<'hub' | 'full_overview'>('hub');

  // History State
  const [historyType, setHistoryType] = useState<'complete_log' | 'attendance' | 'leave' | 'wfh' | 'early_late' | 'help'>('complete_log');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [isCtcBreakdownModalOpen, setIsCtcBreakdownModalOpen] = useState(false);
  
  // Status Modal Detailed State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [processStatus, setProcessStatus] = useState<'success' | 'error'>('success');
  const [processErrorMsg, setProcessErrorMsg] = useState('');

  const [isProcessConfirmOpen, setIsProcessConfirmOpen] = useState(false);
  const [isBulkProcessConfirmOpen, setIsBulkProcessConfirmOpen] = useState(false);
  
  // Salary Structure Form State
  const [salaryForm, setSalaryForm] = useState({
    annual_ctc: 0,
    monthly_gross: 0,
    basic: 0,
    hra: 0,
    special_allowance: 0,
    pf_deduction: 0,
    tax_deduction: 0,
    total_deductions: 0,
    net_pay: 0,
    currency: "INR",
    next_pay_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
    next_increment_date: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0],
    increment_cycle: "annual",
    auto_calculate: true
  });

  // Balanced calculation logic
  useEffect(() => {
    if (salaryForm.auto_calculate && salaryForm.annual_ctc > 0) {
      const monthlyGross = Math.floor(salaryForm.annual_ctc / 12);
      const basic = Math.floor(monthlyGross * 0.4); 
      const hra = Math.floor(basic * 0.4); 
      const pf = Math.min(1800, Math.floor(basic * 0.12));
      const pt = 200; 
      const tax = Math.max(0, Math.floor(monthlyGross * 0.05));
      
      const special = Math.max(0, monthlyGross - (basic + hra));
      const deductions = pf + tax + pt;
      const net = monthlyGross - deductions;

      setSalaryForm(prev => ({
        ...prev,
        monthly_gross: monthlyGross,
        basic,
        hra,
        special_allowance: special,
        pf_deduction: pf,
        tax_deduction: tax,
        total_deductions: deductions,
        net_pay: net
      }));
    } else if (!salaryForm.auto_calculate) {
      const earningsSum = salaryForm.basic + salaryForm.hra + salaryForm.special_allowance;
      const deductionsSum = salaryForm.pf_deduction + salaryForm.tax_deduction + 200;
      const net = earningsSum - deductionsSum;

      setSalaryForm(prev => ({
        ...prev,
        monthly_gross: earningsSum,
        total_deductions: deductionsSum,
        net_pay: net
      }));
    }
  }, [
    salaryForm.auto_calculate,
    salaryForm.annual_ctc,
    salaryForm.basic,
    salaryForm.hra,
    salaryForm.special_allowance,
    salaryForm.pf_deduction,
    salaryForm.tax_deduction
  ]);

  const fetchSalaryData = async (empId: string) => {
    setDetailLoading(true);
    try {
      const response = await authenticatedFetch(`/admin/salaries/${empId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.annual_ctc || data.anual_ctc)) {
          setSalaryForm({
            annual_ctc: data.annual_ctc || data.anual_ctc || 0,
            monthly_gross: data.monthly_gross || 0,
            basic: data.basic || 0,
            hra: data.hra || 0,
            special_allowance: data.special_allowance || 0,
            pf_deduction: data.pf_deduction || 0,
            tax_deduction: data.tax_deduction || 0,
            total_deductions: data.total_deductions || 0,
            net_pay: data.net_pay || 0,
            currency: data.currency || "INR",
            next_pay_date: data.next_pay_date || salaryForm.next_pay_date,
            next_increment_date: data.next_increment_date || salaryForm.next_increment_date,
            increment_cycle: data.increment_cycle || "annual",
            auto_calculate: false 
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch salary data", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchProcessingStatus = async (empId: string, month: number, year: number) => {
    try {
      const response = await authenticatedFetch(`/admin/salary/check-processing-status/${empId}?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setCheckStatus(data);
      }
    } catch (e) {
      console.error("Failed to check processing status", e);
    }
  };

  const fetchFinanceOverview = async (empId: string) => {
    setHistoryLoading(true);
    try {
      const response = await authenticatedFetch(`/admin/employees/${empId}/finance-overview`);
      if (response.ok) {
        const data = await response.json();
        setFinanceOverview(data);
      } else {
        setFinanceOverview(null);
      }
    } catch (e) {
      console.error("Failed to fetch finance overview", e);
      setFinanceOverview(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCtcBreakdown = async (empId: string) => {
    setHistoryLoading(true);
    try {
      const response = await authenticatedFetch(`/admin/salary/ctc-breakdown/${empId}`);
      if (response.ok) {
        const data = await response.json();
        setCtcBreakdown(data);
        setIsCtcBreakdownModalOpen(true);
      } else {
        alert("Failed to fetch detailed CTC breakdown.");
      }
    } catch (e) {
      console.error("Error fetching CTC breakdown", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMonthlyValidation = async () => {
    if (!selectedEmp) return;
    setHistoryLoading(true);
    try {
      // Validate monthly endpoint (POST)
      const response = await authenticatedFetch(`/admin/salary/validate-monthly/${selectedEmp.id}?month=${processMonth}&year=${processYear}`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setMonthlyValidation(data);
      } else {
        setMonthlyValidation(null);
        alert("Failed to fetch monthly processing details.");
      }
    } catch (e) {
      console.error("Error fetching monthly validation", e);
      setMonthlyValidation(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleProcessSalary = async () => {
    if (!selectedEmp) return;
    setHistoryLoading(true);
    setIsProcessConfirmOpen(false); 
    try {
      const response = await authenticatedFetch(`/admin/salary/process/${selectedEmp.id}?year=${processYear}&month=${processMonth}`, {
        method: 'POST'
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (response.ok) {
        if (data.duplicate_prevented) {
          setProcessResult(data);
          setProcessStatus('error');
          setProcessErrorMsg('Transaction Ignored: Salary for this month has already been credited to the account.');
          setIsStatusModalOpen(true);
        } else {
          setProcessResult(data);
          setProcessStatus('success');
          setIsStatusModalOpen(true);
          fetchFinanceOverview(selectedEmp.id);
          fetchProcessingStatus(selectedEmp.id, processMonth, processYear);
        }
      } else {
        setProcessStatus('error');
        const msg = data.message || data.detail || 'The transaction was declined by the payroll gateway due to invalid parameters or connectivity issues.';
        setProcessErrorMsg(msg);
        setIsStatusModalOpen(true);
      }
    } catch (e) {
      console.error("Error processing salary", e);
      setProcessStatus('error');
      setProcessErrorMsg('Network failure while attempting to reach the disbursement server. Please retry in a few moments.');
      setIsStatusModalOpen(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleBulkProcessSalary = async () => {
    setHistoryLoading(true);
    setIsBulkProcessConfirmOpen(false);
    try {
        const response = await authenticatedFetch(`/admin/salary/bulk-process?month=${processMonth}&year=${processYear}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            setBulkResult(data);
            setIsBulkStatusModalOpen(true);
            fetchEmployees(); // Refresh list to update any UI states
        } else {
            const err = await response.json().catch(() => ({}));
            alert(`Batch Failure: ${err.detail || 'Could not execute mass disbursement.'}`);
        }
    } catch (e) {
        console.error("Bulk process error", e);
        alert("System encountered a network error while broadcasting payment instructions.");
    } finally {
        setHistoryLoading(false);
    }
  };

  const fetchTransferLogs = async () => {
    setLogsLoading(true);
    try {
        const response = await authenticatedFetch(`/admin/monthly-salary-employee-details?year=${logsYear}&month=${logsMonth}`);
        if (response.ok) {
            const data = await response.json();
            setLogsData(data.employees || []);
        } else {
            console.error("Failed to fetch transfer logs");
            setLogsData([]);
        }
    } catch (e) {
        console.error("Error fetching logs", e);
        setLogsData([]);
    } finally {
        setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isLogsModalOpen) fetchTransferLogs();
  }, [isLogsModalOpen, logsYear, logsMonth]);

  const handleGenerateOfficialPayslip = async () => {
    if (!selectedEmp) return;
    setHistoryLoading(true);
    try {
      const response = await authenticatedFetch(`/admin/salary/generate-payslip/${selectedEmp.id}?month=${processMonth}&year=${processYear}`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedPayslip(data);
      } else {
        alert("Failed to generate official payslip. Ensure the record is validated.");
      }
    } catch (e) {
      console.error("Error generating payslip", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenSalaryStructure = () => {
    if (selectedEmp) {
      fetchSalaryData(selectedEmp.id);
      setIsEditingSalary(true);
      setIsProcessingMonthly(false);
      setGeneratedPayslip(null);
    }
  };

  const handleOpenProcessing = () => {
    if (selectedEmp) {
      setIsProcessingMonthly(true);
      setIsEditingSalary(false);
      setMonthlyValidation(null);
      setGeneratedPayslip(null);
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, empId: string | null, empName: string}>({
      isOpen: false, empId: null, empName: ''
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Operation successful.');

  const [newEmployee, setNewEmployee] = useState({
      full_name: '',
      email: '',
      password: '',
      employee_id: '',
      designation: '',
      department: 'Engineering',
      role: 'employee',
      join_date: new Date().toISOString().split('T')[0],
      location: 'Remote',
      manager_id: '' 
  });
  
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Laptop', serial: '' });

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('/admin/employees');
      if (response.ok) {
        const data = await response.json();
        const mappedEmployees: Employee[] = (Array.isArray(data) ? data : []).map((apiEmp: any) => ({
          id: apiEmp.id?.toString() || '0',
          employeeId: apiEmp.employeeId || apiEmp.employee_id || `EMP-${apiEmp.id}`,
          name: apiEmp.name || apiEmp.full_name || 'Unknown',
          role: apiEmp.designation || apiEmp.role || 'Employee', 
          department: apiEmp.department || 'Unassigned',
          salary: apiEmp.salary || 0,
          email: apiEmp.email || '',
          status: apiEmp.status || 'active',
          avatar: apiEmp.avatar_url || apiEmp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiEmp.name || apiEmp.full_name || 'User')}&background=random`,
          joinDate: apiEmp.joinDate || apiEmp.join_date ? new Date(apiEmp.joinDate || apiEmp.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown',
          rawJoinDate: apiEmp.joinDate || apiEmp.join_date || new Date().toISOString().split('T')[0],
          location: apiEmp.location || 'Remote',
          manager: apiEmp.manager || 'Unassigned',
          manager_id: apiEmp.manager_id
        }));
        setEmployees(mappedEmployees);
      } else {
        if (response.status === 403) {
            setError("Access Denied: Administrator privileges required.");
        } else {
            setError(`Error ${response.status}: Failed to load employee list.`);
        }
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Network Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchHistory = async (type: string) => {
      if (!selectedEmp) return;
      setHistoryLoading(true);
      setHistoryData([]); 
      
      let endpoint = '';
      switch (type) {
          case 'complete_log':
              endpoint = `/admin/employees/${selectedEmp.id}/complete-log-history?skip=0&limit=100`;
              break;
          case 'attendance': 
              endpoint = `/admin/employees/${selectedEmp.id}/attendance-history?skip=0&limit=100`; 
              break;
          case 'leave': 
              endpoint = `/admin/employees/${selectedEmp.id}/leave-history?skip=0&limit=100`; 
              break;
          case 'wfh': 
              endpoint = `/admin/employees/${selectedEmp.id}/wfh/history`; 
              break;
          case 'early_late': 
              endpoint = `/admin/employees/${selectedEmp.id}/early-late-history?skip=0&limit=100`; 
              break;
          case 'help': 
              endpoint = `/admin/employees/${selectedEmp.id}/help-tickets-history?skip=0&limit=100`; 
              break;
      }

      try {
          const response = await authenticatedFetch(endpoint);
          if (response.ok) {
              const data = await response.json();
              if (type === 'complete_log') {
                  setHistoryData(data.log_data || (Array.isArray(data) ? data : []));
              } else if (type === 'attendance') {
                  setHistoryData(data.attendance_data || (Array.isArray(data) ? data : []));
              } else if (type === 'leave') {
                  setHistoryData(data.leave_data || (Array.isArray(data) ? data : []));
              } else if (type === 'early_late') {
                  setHistoryData(data.early_late_data || (Array.isArray(data) ? data : []));
              } else if (type === 'help') {
                  setHistoryData(data.tickets_data || (Array.isArray(data) ? data : []));
              } else {
                  setHistoryData(Array.isArray(data) ? data : []);
              }
          }
      } catch (error) {
          console.error("History fetch failed", error);
      } finally {
          setHistoryLoading(false);
      }
  };

  const formatHistoryTime = (timeStr: any) => {
      if (!timeStr) return '--:--';
      if (typeof timeStr === 'string' && (timeStr.includes('T') || timeStr.length > 8)) {
          const d = new Date(timeStr);
          if (!isNaN(d.getTime())) {
              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
      }
      return timeStr;
  };

  useEffect(() => {
      if (activeTab === 'History' && selectedEmp) {
          fetchHistory(historyType);
      } else if (activeTab === 'Finance' && selectedEmp) {
          setFinanceSubView('hub');
          fetchFinanceOverview(selectedEmp.id);
          fetchSalaryData(selectedEmp.id);
          fetchProcessingStatus(selectedEmp.id, processMonth, processYear);
          setMonthlyValidation(null); 
          setGeneratedPayslip(null);
      }
  }, [activeTab, historyType, selectedEmp, processMonth, processYear]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `EMP-${year}-${random}`;
  };

  const handleOpenCreate = () => {
      setNewEmployee({
        full_name: '', email: '', password: '', employee_id: generateEmployeeId(),
        designation: '', department: 'Engineering', role: 'employee',
        join_date: new Date().toISOString().split('T')[0], location: 'Remote', manager_id: ''
      });
      setIsCreating(true);
  };

  const handleViewEmployee = async (summaryEmp: Employee, targetTab: 'Overview' | 'Profile' | 'Job' | 'Documents' | 'Assets' | 'History' | 'Finance' = 'Overview') => {
      setDetailLoading(true);
      setSelectedEmp(summaryEmp); 
      setActiveTab(targetTab); 
      setIsEditingSalary(false);
      setIsProcessingMonthly(false);
      setGeneratedPayslip(null);
      setStatusUpdateValue(''); 
      setAssets([]);
      setDocs([]);
      setLeaveBalance(null);
      setDailyStatus(null); 
      setFinanceOverview(null);
      setCheckStatus(null);
      setMonthlyValidation(null);
      
      const currentYear = new Date().getFullYear();

      setTimeout(() => {
          const statuses: DailyStatus['status'][] = ['In', 'Out', 'Leave', 'WFH', 'Not In Yet'];
          const randomStatus = statuses[parseInt(summaryEmp.id) % statuses.length] || 'Not In Yet';
          setDailyStatus({
              status: randomStatus,
              time: (randomStatus === 'In' || randomStatus === 'Out') ? '09:30 AM' : undefined,
              location: (randomStatus === 'In' || randomStatus === 'Out') ? 'Office' : undefined
          });
      }, 600);

      try {
          const detailPromise = authenticatedFetch(`/admin/employees/${summaryEmp.id}`);
          const assetsPromise = authenticatedFetch(`/admin/employees/${summaryEmp.id}/assets`);
          const leavePromise = authenticatedFetch(`/admin/employees/${summaryEmp.id}/leave-balance/${currentYear}`);

          const [detailRes, assetsRes, leaveRes] = await Promise.all([detailPromise, assetsPromise, leavePromise]);

          if (detailRes.ok) {
              const detailData = await detailRes.json();
              const fullDetails: Employee = {
                  ...summaryEmp,
                  employeeId: detailData.employeeId || detailData.employee_id || summaryEmp.employeeId,
                  name: detailData.name || detailData.full_name || summaryEmp.name,
                  email: detailData.email || summaryEmp.email,
                  department: detailData.department || summaryEmp.department,
                  role: detailData.designation || summaryEmp.role,
                  joinDate: detailData.joinDate || detailData.join_date ? new Date(detailData.joinDate || detailData.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : summaryEmp.joinDate,
                  rawJoinDate: detailData.joinDate || detailData.join_date || summaryEmp.rawJoinDate,
                  location: detailData.location || summaryEmp.location,
                  manager: detailData.manager || summaryEmp.manager,
                  avatar: detailData.avatar_url || summaryEmp.avatar,
                  manager_id: detailData.manager_id || summaryEmp.manager_id,
                  status: detailData.status || summaryEmp.status,
                  salary: detailData.salary || summaryEmp.salary, 
                  dob: detailData.dob, gender: detailData.gender, maritalStatus: detailData.marital_status, bloodGroup: detailData.blood_group, address: detailData.address, personalEmail: detailData.personal_email, mobile: detailData.mobile,
              };
              setSelectedEmp(fullDetails);
              setSalaryForm(prev => ({ ...prev, annual_ctc: fullDetails.salary || 0, auto_calculate: true }));
          }

          if (assetsRes.ok) {
              const assetsData = await assetsRes.json();
              const mappedAssets: Asset[] = (Array.isArray(assetsData) ? assetsData : []).map((a: any, idx: number) => ({
                  id: idx, name: a.name || 'Unknown Asset', type: a.asset_type || 'Device', serial: a.serial_number || 'N/A', assignedDate: 'Unknown'
              }));
              setAssets(mappedAssets);
          }

          if (leaveRes.ok) {
              const leaveData = await leaveRes.json();
              setLeaveBalance(leaveData);
          }
      } catch (e) { console.error("Error fetching employee details", e); } finally { setDetailLoading(false); }
  };

  const handleUpdateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    if (selectedEmp && selectedEmp.id === id) {
      setSelectedEmp(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const saveEmployeeChanges = async () => {
      if (!selectedEmp) return;
      try {
          const payload = {
              employee_id: selectedEmp.employeeId, 
              full_name: selectedEmp.name, 
              email: selectedEmp.email, 
              department: selectedEmp.department, 
              designation: selectedEmp.role, 
              join_date: selectedEmp.rawJoinDate, 
              location: selectedEmp.location, 
              manager_id: selectedEmp.manager_id ? Number(selectedEmp.manager_id) : 0, 
              dob: selectedEmp.dob, 
              gender: selectedEmp.gender, 
              marital_status: selectedEmp.maritalStatus, 
              blood_group: selectedEmp.bloodGroup, 
              address: selectedEmp.address, 
              personal_email: selectedEmp.personalEmail, 
              mobile: selectedEmp.mobile, 
              avatar_url: selectedEmp.avatar, 
              status: selectedEmp.status
          };
          const response = await authenticatedFetch(`/admin/employees/${selectedEmp.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          if (response.ok) {
              setSuccessMessage("Employee updated successfully.");
              setShowSuccess(true);
              setTimeout(() => { setShowSuccess(false); fetchEmployees(); }, 2000);
          } else {
              const err = await response.json().catch(() => ({}));
              alert(`Failed to update employee: ${err.detail || 'Unknown error'}`);
          }
      } catch (e) { console.error(e); alert("Error saving changes."); }
  };

  const handleStatusChange = async (newStatus: string) => {
      if (!selectedEmp || !newStatus) return;
      const isValid = VALID_STATUSES.some(s => s.value === newStatus);
      if(!isValid) { alert("Invalid status selected."); return; }
      const statusLabel = VALID_STATUSES.find(s => s.value === newStatus)?.label || newStatus;
      setDetailLoading(true);
      try {
          const response = await authenticatedFetch(`/admin/employees/${selectedEmp.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
          if (response.ok) {
              setSuccessMessage(`Status updated to ${statusLabel}`);
              setShowSuccess(true);
              handleUpdateEmployee(selectedEmp.id, 'status', newStatus);
              setStatusUpdateValue('');
              setTimeout(() => setShowSuccess(false), 2000);
          } else {
              const err = await response.json().catch(() => ({}));
              alert(`Failed to update status: ${err.detail || 'Unknown error'}`);
          }
      } catch (e) { console.error(e); alert("Error updating status."); } finally { setDetailLoading(false); }
  };

  const executeDelete = async () => {
      if (!deleteConfirmation.empId) return;
      setDetailLoading(true);
      try {
          const response = await authenticatedFetch(`/admin/employees/${deleteConfirmation.empId}`, { method: 'DELETE' });
          if (response.ok) {
              setSuccessMessage("Employee deleted successfully.");
              setShowSuccess(true);
              setDeleteConfirmation({ isOpen: false, empId: null, empName: '' });
              setSelectedEmp(null); 
              setTimeout(() => { setShowSuccess(false); fetchEmployees(); }, 2000);
          } else {
              const err = await response.json().catch(() => ({}));
              alert(`Failed to delete employee: ${err.detail || 'Unknown error'}`);
          }
      } catch (e) { console.error(e); alert("Error deleting employee."); } finally { setDetailLoading(false); }
  };

  const handleAction = async (action: string) => {
    if (!selectedEmp) return;
    if (action === 'delete') {
      setDeleteConfirmation({ isOpen: true, empId: selectedEmp.id, empName: selectedEmp.name });
    } else if (action === 'password') {
       if (window.confirm(`Are you sure you want to reset the password for ${selectedEmp.name}?`)) {
           try {
               const response = await authenticatedFetch(`/admin/employees/${selectedEmp.id}/reset-password`, { method: 'POST' });
               if (response.ok) {
                   const data = await response.json();
                   if (data.new_password || data.password) {
                        alert(`Password Reset Successful!\n\nNew Password: ${data.new_password || data.password}\n\nPlease share this securely with the employee.`);
                   } else { alert(data.message || data.detail || `Password reset command sent successfully.`); }
               } else {
                   const err = await response.json().catch(() => ({}));
                   alert(`Failed to reset password: ${err.detail || 'Unknown error'}`);
               }
           } catch (e) { console.error(e); alert("Error resetting password."); }
       }
    }
  };

  const handleSaveSalaryStructure = async () => {
      if (!selectedEmp) return;
      setDetailLoading(true);
      try {
          const response = await authenticatedFetch(`/admin/salaries/${selectedEmp.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                annual_ctc: Number(salaryForm.annual_ctc), monthly_gross: Number(salaryForm.monthly_gross), basic: Number(salaryForm.basic), hra: Number(salaryForm.hra), special_allowance: Number(salaryForm.special_allowance), pf_deduction: Number(salaryForm.pf_deduction), tax_deduction: Number(salaryForm.tax_deduction), total_deductions: Number(salaryForm.total_deductions), net_pay: Number(salaryForm.net_pay), currency: salaryForm.currency, next_pay_date: salaryForm.next_pay_date, next_increment_date: salaryForm.next_increment_date, increment_cycle: salaryForm.increment_cycle
              })
          });
          if (response.ok) {
              setSuccessMessage("Payroll structure successfully updated.");
              setShowSuccess(true);
              setIsEditingSalary(false);
              handleUpdateEmployee(selectedEmp.id, 'salary', Number(salaryForm.annual_ctc));
              setTimeout(() => setShowSuccess(false), 2000);
          } else {
              const err = await response.json().catch(() => ({ detail: 'API request failed.' }));
              alert(`Error: ${err.detail}`);
          }
      } catch (e) { console.error(e); alert("Network failure. Could not update payroll."); } finally { setDetailLoading(false); }
  };

  const handleAddEmployee = async () => {
    if(!newEmployee.full_name || !newEmployee.email || !newEmployee.password || !newEmployee.employee_id) {
      alert("Name, Email, Password and Employee ID are required."); return;
    }
    setLoading(true);
    try {
      const payload = { 
        email: newEmployee.email, 
        password: newEmployee.password, 
        full_name: newEmployee.full_name, 
        employee_id: newEmployee.employee_id, 
        department: newEmployee.department, 
        designation: newEmployee.designation, 
        join_date: newEmployee.join_date, 
        location: newEmployee.location, 
        manager_id: newEmployee.manager_id ? Number(newEmployee.manager_id) : 0, 
        role: newEmployee.role 
      };
      const response = await authenticatedFetch('/admin/employees', { method: 'POST', body: JSON.stringify(payload) });
      if (response.ok) {
        setSuccessMessage("Employee record created successfully.");
        setShowSuccess(true);
        setNewEmployee({ full_name: '', email: '', password: '', employee_id: generateEmployeeId(), designation: '', department: 'Engineering', role: 'employee', join_date: new Date().toISOString().split('T')[0], location: 'Remote', manager_id: '' });
        setTimeout(() => { setShowSuccess(false); setIsCreating(false); fetchEmployees(); }, 2000);
      } else {
        const err = await response.json(); 
        alert(err.detail || "Failed to create employee");
      }
    } catch (e) { 
      console.error(e); 
      alert("Error contacting server."); 
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAsset = () => {
    if(!newAsset.name) return;
    const asset: Asset = { id: Date.now(), name: newAsset.name, type: newAsset.type, serial: newAsset.serial || 'N/A', assignedDate: new Date().toLocaleDateString() };
    setAssets([...assets, asset]); setIsAssetModalOpen(false); setNewAsset({ name: '', type: 'Laptop', serial: '' });
  };

  const handleRevokeAsset = (id: number) => { if(window.confirm("Revoke this asset?")) { setAssets(assets.filter(a => a.id !== id)); } };
  const handleVerifyDoc = (id: number) => { setDocs(docs.map(d => d.id === id ? { ...d, status: 'Verified' } : d)); };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (['active', 'full_time', 'permanent'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (['in-probation', 'probation', 'trainee'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (['notice-period', 'notice period', 'on_leave', 'on leave'].includes(s)) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20';
  };

  const renderStatusBadge = () => {
      if (!dailyStatus) { return <div className="h-6 w-24 bg-zinc-200 dark:bg-white/10 rounded-full animate-pulse"></div>; }
      switch (dailyStatus.status) {
          case 'In': return ( <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/30"> <span className="relative flex h-2 w-2"> <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span> </span> In @ {dailyStatus.time} </span> );
          case 'Out': return ( <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold border border-zinc-200 dark:border-white/10"> <IconStopCircle className="w-3.5 h-3.5" /> Out @ {dailyStatus.time} </span> );
          case 'Leave': return ( <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-emerald-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-500/30"> <IconSun className="w-3.5 h-3.5" /> On Leave </span> );
          case 'WFH': return ( <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-500/30"> <IconHome className="w-3.5 h-3.5" /> WFH </span> );
          default: return ( <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800/30"> <IconClock className="w-3.5 h-3.5" /> Not In Yet </span> );
      }
  };

  const renderHistoryTab = () => (
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex gap-2 overflow-x-auto custom-scrollbar">
              {[ { id: 'complete_log', label: 'Log History', icon: IconFileText }, { id: 'attendance', label: 'Attendance Logs', icon: IconClock }, { id: 'leave', label: 'Leaves', icon: IconSun }, { id: 'wfh', label: 'WFH', icon: IconHome }, { id: 'early_late', label: 'Early/Late', icon: IconClock }, { id: 'help', label: 'Help Tickets', icon: IconMessage } ].map((tab) => (
                  <button key={tab.id} onClick={() => setHistoryType(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${ historyType === tab.id ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5' }`} > <tab.icon className="w-4 h-4" /> {tab.label} </button>
              ))}
          </div>
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50 dark:bg-white/5 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-bold sticky top-0 z-10">
                      <tr>
                          {historyType === 'complete_log' && <> <th className="px-6 py-4">Date</th> <th className="px-6 py-4">Type</th> <th className="px-6 py-4">Title</th> <th className="px-6 py-4">Description</th> <th className="px-6 py-4">Status</th> </>}
                          {historyType === 'attendance' && <> <th className="px-6 py-4">Date</th> <th className="px-6 py-4">Clock In</th> <th className="px-6 py-4">Clock Out</th> <th className="px-6 py-4">Status</th> <th className="px-6 py-4">Total Hours</th> <th className="px-6 py-4">Notes</th> </>}
                          {historyType === 'leave' && <> <th className="px-6 py-4">Start Date</th> <th className="px-6 py-4">End Date</th> <th className="px-6 py-4">Duration</th> <th className="px-6 py-4">Type</th> <th className="px-6 py-4">Reason</th> <th className="px-6 py-4">Status</th> </>}
                          {historyType === 'wfh' && <> <th className="px-6 py-4">Start Date</th> <th className="px-6 py-4 text-zinc-700 dark:text-zinc-300">End Date</th> <th className="px-6 py-4">Reason</th> <th className="px-6 py-4">Status</th> </>}
                          {historyType === 'early_late' && <> <th className="px-6 py-4">Date</th> <th className="px-6 py-4">Type</th> <th className="px-6 py-4">Duration</th> <th className="px-6 py-4">Reason</th> </>}
                          {historyType === 'help' && <> <th className="px-6 py-4">ID</th> <th className="px-6 py-4">Subject</th> <th className="px-6 py-4">Category</th> <th className="px-6 py-4">Priority</th> <th className="px-6 py-4">Status</th> </>}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                      {historyLoading ? ( <tr><td colSpan={6} className="p-12 text-center text-zinc-500">Loading history...</td></tr> ) : historyData.length === 0 ? ( <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No records found.</td></tr> ) : (
                          historyData.map((item, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                  {historyType === 'complete_log' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.date}</td> <td className="px-6 py-4"> <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${ item.type === 'attendance' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/10' : item.type === 'leave' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-emerald-500/20' : item.type === 'wfh' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : item.type === 'help_ticket' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' : 'bg-gray-50 text-gray-700 border-gray-200' }`}> {item.type?.replace('_', ' ')} </span> </td> <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-white">{item.title}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={item.description}>{item.description}</td> <td className="px-6 py-4"> <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${item.status === 'approved' || item.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}> {item.status} </span> </td> </>}
                                  {historyType === 'attendance' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.date}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{formatHistoryTime(item.clock_in)}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{formatHistoryTime(item.clock_out)}</td> <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded text-xs font-bold capitalize">{item.status}</span></td> <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-white">{item.total_hours || '-'}</td> <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-xs">{item.notes || '-'}</td> </>}
                                  {historyType === 'leave' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.start_date}</td> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.end_date}</td> <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-white">{item.days} Day{item.days !== 1 ? 's' : ''}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 capitalize">{item.leave_type}</td> <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-xs" title={item.reason}>{item.reason}</td> <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded text-xs font-bold capitalize">{item.status || 'Approved'}</span></td> </>}
                                  {historyType === 'wfh' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.start_date}</td> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.end_date}</td> <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-xs">{item.reason}</td> <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 rounded text-xs font-bold">{item.status || 'Approved'}</span></td> </>}
                                  {historyType === 'early_late' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{item.date}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{item.type}</td> <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-white">{item.duration}</td> <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-xs">{item.reason}</td> </>}
                                  {historyType === 'help' && <> <td className="px-6 py-4 text-sm font-mono text-zinc-500">#{item.id}</td> <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-white">{item.subject}</td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{item.category}</td> <td className="px-6 py-4 text-sm"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>{item.priority || 'Normal'}</span></td> <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 capitalize">{item.status || 'Pending'}</td> </>}
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderOverview = (emp: Employee) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Leave Balance</h3>
             {leaveBalance ? ( <div className="space-y-4"> <div> <div className="flex justify-between text-sm mb-1"> <span className="text-zinc-600 dark:text-zinc-400 font-medium">Annual Leave</span> <span className="font-bold text-zinc-800 dark:text-white">{leaveBalance.leaves_left} / {leaveBalance.total_leaves}</span> </div> <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden"> <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${leaveBalance.total_leaves > 0 ? (leaveBalance.leaves_left / leaveBalance.total_leaves) * 100 : 0}%` }}></div> </div> </div> </div> ) : ( <p className="text-xs text-zinc-400 italic">No leave data available.</p> )}
          </div>
           <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Contact</h3>
             <div className="space-y-3">
                 <div className="flex items-center gap-3 text-sm"> <IconMail className="w-4 h-4 text-zinc-400" /> <span className="text-zinc-800 dark:text-zinc-200 truncate">{emp.email}</span> </div>
                 <div className="flex items-center gap-3 text-sm"> <IconSmartphone className="w-4 h-4 text-zinc-400" /> <span className="text-zinc-800 dark:text-zinc-200">{emp.mobile || 'Not set'}</span> </div>
                 <div className="flex items-center gap-3 text-sm"> <IconMapPin className="w-4 h-4 text-zinc-400" /> <span className="text-zinc-800 dark:text-zinc-200">{emp.location}</span> </div>
             </div>
          </div>
      </div>
  );

  const renderProfileTab = (emp: Employee) => (
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
           <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Personal Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="group"> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Full Name</label> <input type="text" value={emp.name} onChange={(e) => handleUpdateEmployee(emp.id, 'name', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
               <div className="group"> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Date of Birth</label> <input type="date" value={emp.dob || ''} onChange={(e) => handleUpdateEmployee(emp.id, 'dob', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
               <div className="group"> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Gender</label> <select value={emp.gender || ''} onChange={(e) => handleUpdateEmployee(emp.id, 'gender', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"> <option value="">Select</option> <option value="Male">Male</option> <option value="Female">Female</option> <option value="Other">Other</option> </select> </div>
               <div className="group"> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Address</label> <input type="text" value={emp.address || ''} onChange={(e) => handleUpdateEmployee(emp.id, 'address', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
           </div>
           <div className="mt-8 flex justify-end">
               <button onClick={saveEmployeeChanges} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm shadow-md transition-all">Save Changes</button>
           </div>
      </div>
  );

  const renderJobTab = (emp: Employee) => (
      <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Employment Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Employee ID</label> <div className="px-3 py-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 font-mono">{emp.employeeId}</div> </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Department</label> <input type="text" value={emp.department} onChange={(e) => handleUpdateEmployee(emp.id, 'department', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Designation</label> <input type="text" value={emp.role} onChange={(e) => handleUpdateEmployee(emp.id, 'role', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Manager</label> <select value={emp.manager_id || 0} onChange={(e) => handleUpdateEmployee(emp.id, 'manager_id', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" > <option value={0}>Unassigned</option> {employees.filter(e => e.id !== emp.id).map(manager => ( <option key={manager.id} value={manager.id}> {manager.name} {manager.email ? `(${manager.email})` : ''} </option> ))} </select> </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Joining Date</label> <input type="date" value={emp.rawJoinDate} onChange={(e) => handleUpdateEmployee(emp.id, 'rawJoinDate', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Base Location</label> <input type="text" value={emp.location} onChange={(e) => handleUpdateEmployee(emp.id, 'location', e.target.value)} className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors" /> </div>
               </div>
               <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setIsSalaryHistoryOpen(true)} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-sm font-bold transition-colors">Salary History</button>
                   <button onClick={saveEmployeeChanges} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm shadow-md transition-all">Save Changes</button>
               </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
               <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Lifecycle Management</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                   <div>
                       <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Update Status</label>
                       <div className="flex gap-2">
                           <select value={statusUpdateValue} onChange={(e) => setStatusUpdateValue(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors" > <option value="" disabled>Select Status...</option> {VALID_STATUSES.map(status => ( <option key={status.value} value={status.value}>{status.label}</option> ))} </select>
                           <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(statusUpdateValue); }} disabled={!statusUpdateValue || detailLoading} className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center min-w-[80px]" > {detailLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : 'Update'} </button>
                       </div>
                   </div>
                   <div> <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Security</label> <button onClick={() => handleAction('password')} className="w-full px-4 py-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/20 text-zinc-600 dark:text-zinc-300 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center justify-center gap-2"> <IconKey className="w-4 h-4" /> Reset Password </button> </div>
               </div>
          </div>
      </div>
  );

  const renderFullFinanceOverview = () => {
    if (historyLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!financeOverview || !financeOverview.salary) return <div className="p-12 text-center text-zinc-500 italic">Financial data currently unavailable for this record.</div>;
    const { salary, payCycle } = financeOverview; const payslips = financeOverview.payslips || [];
    return ( <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 pb-12"> <div className="flex items-center justify-between"> <button onClick={() => setFinanceSubView('hub')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-600 transition-colors uppercase tracking-widest" > <IconChevronLeft className="w-4 h-4" /> Back to Finance Hub </button> </div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm"> <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Earnings Breakdown</h3> <div className="space-y-4"> {[ { label: 'Basic Salary', val: salary.basic }, { label: 'HRA Allowance', val: salary.hra }, { label: 'Special Allowance', val: salary.specialAllowance } ].map((item, idx) => ( <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-white/5"> <span className="text-sm text-zinc-500">{item.label}</span> <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(item.val)}</span> </div> ))} <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-white/5 bg-red-50/20 dark:bg-red-900/5 px-2 rounded-lg mt-4"> <span className="text-sm font-bold text-red-600 dark:text-red-400">Total Deductions</span> <span className="text-sm font-bold text-red-600 dark:text-red-400">-{formatCurrency(salary.totalDeductions)}</span> </div> </div> </div> <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm"> <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Pay Cycle & Increments</h3> <div className="space-y-6"> <div className="flex items-start gap-4"> <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-xl text-cyan-600"> <IconCalendar className="w-6 h-6" /> </div> <div> <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Last Payout</p> <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{payCycle.lastPaid ? new Date(payCycle.lastPaid).toLocaleDateString() : 'N/A'}</p> </div> </div> <div className="flex items-start gap-4"> <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl text-emerald-600"> <IconSparkles className="w-6 h-6" /> </div> <div> <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Next Revision</p> <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{payCycle.nextIncrementDate ? new Date(payCycle.nextIncrementDate).toLocaleDateString() : 'N/A'}</p> <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Cycle: {payCycle.incrementCycle}</p> </div> </div> </div> </div> </div> <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden"> <div className="p-6 border-b border-zinc-200 dark:border-white/5"> <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Recent Payslips</h3> </div> <div className="overflow-x-auto"> <table className="w-full text-left text-sm"> <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 uppercase text-[10px] font-bold tracking-widest"> <tr> <th className="px-6 py-4">Month / Year</th> <th className="px-6 py-4">Amount</th> <th className="px-6 py-4">Status</th> <th className="px-6 py-4 text-right">Actions</th> </tr> </thead> <tbody className="divide-y divide-zinc-200 dark:divide-white/5"> {payslips.length === 0 ? ( <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No payslips recorded.</td></tr> ) : ( payslips.map((slip, i) => ( <tr key={slip.id || i} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"> <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200"> {new Date(2000, Number(slip.month) - 1).toLocaleString('default', { month: 'long' })} {slip.year} </td> <td className="px-6 py-4 font-mono font-medium"> {formatCurrency(slip.amount)} </td> <td className="px-6 py-4"> <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wide"> {slip.status} </span> </td> <td className="px-6 py-4 text-right"> <button className="p-2 text-zinc-400 hover:text-cyan-600 transition-colors"><IconDownload className="w-4 h-4" /></button> </td> </tr> )) )} </tbody> </table> </div> </div> </div> );
  };

  const isAlreadyPaid = (month: number, year: number) => {
    if (!financeOverview?.payslips) return false;
    return financeOverview.payslips.some(p => {
       const pMonth = typeof p.month === 'string' ? new Date(`${p.month} 1, 2000`).getMonth() + 1 : Number(p.month);
       return pMonth === month && Number(p.year) === year;
    });
  };

  const renderFinanceHub = () => {
    if (historyLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!financeOverview || !financeOverview.salary || !selectedEmp) return <div className="p-12 text-center text-zinc-500 italic">Financial data currently unavailable.</div>;
    
    const annualCtc = salaryForm.annual_ctc || financeOverview.salary.annualCTC; 
    const netPay = salaryForm.net_pay || financeOverview.salary.netPay;
    const payoutInfo = (() => { const today = new Date(); const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); const diffTime = nextMonth.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); return { date: nextMonth, days: diffDays }; })();
    
    const isPaid = checkStatus?.has_paid_payslip || false;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 shadow-sm md:col-span-2 flex flex-col justify-between bg-gradient-to-br from-white to-cyan-50/5 dark:from-zinc-900 dark:to-cyan-950/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <IconCash className="w-24 h-24 text-cyan-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl text-cyan-600">
                  <IconShield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Payroll Configuration</h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-md leading-relaxed">
                Adjust earnings components, apply statutory deductions, and manage the annual structure for this employee record.
              </p>
            </div>
            <button 
              onClick={handleOpenSalaryStructure} 
              className="w-full flex items-center justify-between gap-4 p-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl shadow-zinc-500/10 transition-all transform hover:-translate-y-0.5 group/btn"
            >
              <div className="flex items-center gap-3 pl-2">
                <IconFileEdit className="w-5 h-5 opacity-80 group-hover/btn:text-cyan-500 transition-colors" />
                <span className="text-sm">Manage Package</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-black/10 dark:bg-zinc-100 rounded-xl text-[11px] font-mono tracking-tighter whitespace-nowrap">
                <span className="text-zinc-400 dark:text-zinc-500">CTC:</span>
                <span className="text-white dark:text-black font-bold">{formatCurrency(annualCtc)}</span>
                <span className="h-3 w-px bg-white/20 dark:bg-black/10 mx-1"></span>
                <span className="text-zinc-400 dark:text-zinc-500">NET:</span>
                <span className="text-emerald-500 dark:text-emerald-600 font-bold">{formatCurrency(netPay)}</span>
              </div>
            </button>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 shadow-sm flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><IconClock className="w-12 h-12" /></div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Payout Countdown</h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white font-mono">{payoutInfo.days}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-lg text-white shadow-lg">
                  <IconCheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{payoutInfo.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
              <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Next Disbursement</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isPaid ? (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-[40px] border-2 border-emerald-500/20 shadow-xl flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-500 text-white rounded-[30px] shadow-lg shadow-emerald-500/40">
                  <IconCheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 leading-none">Salary Disbursed</h4>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500/70 mt-2 uppercase tracking-[0.2em]">{new Date(2000, (checkStatus?.month || 1) - 1).toLocaleString('default', { month: 'long' })} {checkStatus?.year}</p>
                </div>
              </div>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(checkStatus?.payslip_amount || 0)}</span>
                <span className="text-xs font-bold text-emerald-700/50 uppercase">Credited</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-emerald-700 dark:text-emerald-500/80 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit">
                <IconShield className="w-3 h-3" /> TRANSACTION COMPLETED: TXN-{checkStatus?.payslip_id}
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsProcessConfirmOpen(true)} 
              disabled={historyLoading} 
              className="p-8 bg-gradient-to-br from-[#5f259f] to-[#3a0b74] rounded-[40px] border border-[#7d39c5] shadow-2xl hover:shadow-[#5f259f]/40 transition-all group text-left flex flex-col h-full min-h-[250px] relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-[25px] text-white w-fit mb-8 shadow-inner">
                <IconSend className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-white leading-tight">Direct Disbursement</h4>
              <p className="text-xs text-white/60 mt-2 max-w-[250px] font-medium leading-relaxed">
                Initiate wire transfer for the current cycle. This will broadcast payment instructions to the settlement network.
              </p>
              <div className="mt-auto pt-6 flex items-center gap-3 text-[11px] font-black text-white group-hover:gap-5 transition-all uppercase tracking-[0.25em]">
                {historyLoading ? 'PROCESSING...' : 'Disburse Salary Now'}
                <IconChevronRight className="w-4 h-4" />
              </div>
            </button>
          )}
          
          <button 
            onClick={handleOpenProcessing} 
            className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-sm hover:border-amber-500/40 hover:shadow-xl transition-all group text-left flex flex-col h-full min-h-[250px]"
          >
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-[25px] text-amber-600 w-fit mb-8 group-hover:rotate-12 transition-transform">
              <IconCalendar className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">Monthly Engine</h4>
            <p className="text-xs text-zinc-500 mt-2 max-w-[250px] font-medium leading-relaxed">Audit attendance vectors, calculate LOP adjustments, and finalize the payload for distribution.</p>
            <div className="mt-auto pt-6 flex items-center gap-3 text-[11px] font-black text-amber-600 group-hover:gap-5 transition-all uppercase tracking-[0.25em]">
              Run Validation Loop
              <IconChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderFinanceTab = () => { if (financeSubView === 'full_overview') { return renderFullFinanceOverview(); } return renderFinanceHub(); };

  const renderSalaryStructurePage = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => setIsEditingSalary(false)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-600 font-bold uppercase tracking-wide">
          <IconChevronLeft className="w-4 h-4" /> Back to Profile
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Salary Structure Editor</h2>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Annual Components</h3>
          <div className="flex items-center gap-3">
             <span className="text-sm text-zinc-500">Auto Calculate</span>
             <button 
               onClick={() => setSalaryForm(prev => ({ ...prev, auto_calculate: !prev.auto_calculate }))}
               className={`relative w-11 h-6 rounded-full transition-colors ${salaryForm.auto_calculate ? 'bg-cyan-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
             >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${salaryForm.auto_calculate ? 'translate-x-5' : 'translate-x-0'}`}></div>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Annual CTC</label>
                <input 
                  type="number" 
                  value={salaryForm.annual_ctc} 
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, annual_ctc: Number(e.target.value) }))}
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white outline-none focus:border-cyan-500" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Basic Salary (Monthly)</label>
                    <input 
                      type="number" 
                      value={salaryForm.basic} 
                      disabled={salaryForm.auto_calculate}
                      onChange={(e) => setSalaryForm(prev => ({ ...prev, basic: Number(e.target.value) }))}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 disabled:opacity-60" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">HRA (Monthly)</label>
                    <input 
                      type="number" 
                      value={salaryForm.hra} 
                      disabled={salaryForm.auto_calculate}
                      onChange={(e) => setSalaryForm(prev => ({ ...prev, hra: Number(e.target.value) }))}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 disabled:opacity-60" 
                    />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Special Allowance</label>
                <input 
                  type="number" 
                  value={salaryForm.special_allowance} 
                  disabled={salaryForm.auto_calculate}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 disabled:opacity-60" 
                />
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-white/5">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Calculated Deductions</h4>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-500">PF Deduction</span>
                       <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(salaryForm.pf_deduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-500">Income Tax (Est.)</span>
                       <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(salaryForm.tax_deduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-500">Prof. Tax</span>
                       <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(200)}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-white/5 flex justify-between">
                       <span className="text-sm font-bold text-red-600">Total Deductions</span>
                       <span className="font-bold text-red-600">-{formatCurrency(salaryForm.total_deductions)}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">Estimated Net Take Home</p>
                 <p className="text-3xl font-black text-emerald-800 dark:text-emerald-300">{formatCurrency(salaryForm.net_pay)}</p>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-end gap-3 pt-8 border-t border-zinc-100 dark:border-white/5">
           <button onClick={() => setIsEditingSalary(false)} className="px-6 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-lg transition-colors">Discard</button>
           <button onClick={handleSaveSalaryStructure} className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-bold shadow-xl hover:opacity-90 transition-opacity">Update Payroll Structure</button>
        </div>
      </div>
    </div>
  );

  const renderMonthlyProcessingPage = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => setIsProcessingMonthly(false)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-600 font-bold uppercase tracking-wide">
          <IconChevronLeft className="w-4 h-4" /> Back to Finance Hub
        </button>
        <div className="flex items-center gap-4">
           <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
              <select value={processMonth} onChange={(e) => setProcessMonth(parseInt(e.target.value))} className="bg-transparent text-sm font-bold px-3 py-1 outline-none">
                 {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                 ))}
              </select>
              <select value={processYear} onChange={(e) => setProcessYear(parseInt(e.target.value))} className="bg-transparent text-sm font-bold px-3 py-1 outline-none border-l border-zinc-200 dark:border-white/10">
                 {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
           <button onClick={fetchMonthlyValidation} disabled={historyLoading} className="px-5 py-2 bg-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2">
              {historyLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><IconCheckCircle className="w-4 h-4" /> Run Audit</>}
           </button>
        </div>
      </div>

      {monthlyValidation ? (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Calendar Days', val: monthlyValidation.days_in_month, color: 'text-zinc-500' },
                { label: 'Unpaid Leaves', val: monthlyValidation.unpaid_leave_days, color: 'text-red-500' },
                { label: 'Payable Days', val: monthlyValidation.payable_days, color: 'text-emerald-600' },
                { label: 'Net Payable', val: formatCurrency(monthlyValidation.final_net_salary), color: 'text-cyan-600', bold: true }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm">
                 <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Disbursement Logic</h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-100 dark:border-white/5">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Daily Rate Calculation</p>
                       <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{monthlyValidation.calculation_details?.daily_salary_calculation}</code>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-100 dark:border-white/5">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Leave Deduction Payload</p>
                       <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{monthlyValidation.calculation_details?.leave_deduction_calculation}</code>
                    </div>
                 </div>
                 
                 <div className="mt-8 flex gap-3">
                    {!checkStatus?.has_paid_payslip ? (
                      <button onClick={() => setIsProcessConfirmOpen(true)} className="flex-1 py-4 bg-[#5f259f] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                        <IconSend className="w-5 h-5" /> Initiate Payment
                      </button>
                    ) : (
                      <div className="flex-1 py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
                        <IconCheckCircle className="w-5 h-5" /> Already Disbursed
                      </div>
                    )}
                    <button onClick={handleGenerateOfficialPayslip} className="px-6 py-4 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-colors">
                       <IconFileText className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {generatedPayslip ? (
                <div className="bg-white text-black p-8 shadow-2xl rounded-sm border border-zinc-200 animate-in zoom-in-95 duration-300 h-fit sticky top-24">
                   <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                      <div>
                         <h2 className="text-xl font-black uppercase tracking-tighter">NEXUS ENTERPRISE</h2>
                         <p className="text-[8px] text-zinc-500 font-mono">OFFICIAL PAYSLIP RECONCILIATION</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold">#SLIP-{generatedPayslip.payslip_id}</p>
                         <p className="text-[10px]">{new Date(generatedPayslip.pay_date).toLocaleDateString()}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8 mb-8 text-[10px]">
                      <div>
                         <p className="text-zinc-400 uppercase font-bold mb-1">Employee Detail</p>
                         <p className="font-bold">{generatedPayslip.employee_name}</p>
                         <p>{generatedPayslip.designation}</p>
                         <p>{generatedPayslip.department}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-zinc-400 uppercase font-bold mb-1">Payment Basis</p>
                         <p>Days in Month: {generatedPayslip.total_days_in_month}</p>
                         <p>LOP Days: {generatedPayslip.unpaid_leaves_taken + (generatedPayslip.half_day_leaves * 0.5)}</p>
                         <p className="font-bold">Payable Days: {generatedPayslip.total_working_days}</p>
                      </div>
                   </div>

                   <table className="w-full text-[10px] border-collapse mb-8">
                      <thead>
                         <tr className="border-y border-black font-bold">
                            <th className="py-1 text-left">Earnings Components</th>
                            <th className="py-1 text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                         <tr><td className="py-2">Basic Salary</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.basic_payable)}</td></tr>
                         <tr><td className="py-2">House Rent Allowance</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.hra_payable)}</td></tr>
                         <tr><td className="py-2">Special Allowance</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.special_allowance_payable)}</td></tr>
                         <tr className="font-bold border-t border-black"><td className="py-2">Gross Earnings</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.gross_salary)}</td></tr>
                      </tbody>
                   </table>

                   <table className="w-full text-[10px] border-collapse mb-8">
                      <thead>
                         <tr className="border-y border-black font-bold">
                            <th className="py-1 text-left">Deductions</th>
                            <th className="py-1 text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                         <tr><td className="py-2">Employee Provident Fund (EPF)</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.pf_deduction)}</td></tr>
                         <tr><td className="py-2">Income Tax (TDS)</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.tax_deduction)}</td></tr>
                         <tr><td className="py-2">Professional Tax</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.professional_tax)}</td></tr>
                         <tr className="font-bold border-t border-black"><td className="py-2">Total Deductions</td><td className="py-2 text-right">{formatCurrency(generatedPayslip.total_deductions)}</td></tr>
                      </tbody>
                   </table>

                   <div className="bg-zinc-100 p-4 flex justify-between items-center mb-6">
                      <p className="text-[10px] font-black uppercase">Net Salary Disbursed</p>
                      <p className="text-lg font-black">{formatCurrency(generatedPayslip.final_processed_salary)}</p>
                   </div>
                   
                   <p className="text-[8px] italic text-zinc-500 mb-8">Amount in words: {numberToWords(generatedPayslip.final_processed_salary)}</p>
                   
                   <div className="flex justify-between items-end">
                      <div className="w-24 h-8 bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[6px] text-zinc-300">SYSTEM GENERATED</div>
                      <div className="text-right">
                         <div className="w-24 h-10 border-b border-black mb-1"></div>
                         <p className="text-[8px] font-bold">Authorized Signatory</p>
                      </div>
                   </div>
                   
                   <div className="mt-8 flex justify-center no-print">
                      <button onClick={() => window.print()} className="px-4 py-1.5 bg-black text-white text-[10px] font-bold rounded flex items-center gap-2">
                        <IconPrinter className="w-3 h-3" /> PRINT DOCUMENT
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-400">
                   <IconFileText className="w-12 h-12 opacity-20 mb-4" />
                   <p className="text-sm font-medium">Verify data to generate payslip preview.</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5">
           <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-full mb-4">
              <IconCalendar className="w-8 h-8 text-zinc-300" />
           </div>
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Monthly Audit Engine</h3>
           <p className="text-sm text-zinc-500 max-w-sm text-center mt-2">Run the audit cycle for a specific period to calculate LOPs and verify net payables.</p>
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Employee Documents</h3>
      </div>
      <div className="space-y-3">
        {docs.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No documents uploaded.</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg">
                  <IconFileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{doc.name}</p>
                  <p className="text-xs text-zinc-500">{doc.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {doc.status === 'Pending' && (
                  <button onClick={() => handleVerifyDoc(doc.id)} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-500/20">Verify</button>
                )}
                <button className="p-2 text-zinc-400 hover:text-cyan-600 transition-colors"><IconDownload className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAssetsTab = () => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-white/5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Assigned Assets</h3>
        <button onClick={() => setIsAssetModalOpen(true)} className="flex items-center gap-2 text-xs font-bold text-cyan-600 hover:underline">
          <IconPlus className="w-4 h-4" /> Assign New
        </button>
      </div>
      <div className="space-y-4">
        {assets.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No assets assigned.</p>
        ) : (
          assets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-200 dark:bg-white/10 rounded-xl text-zinc-500 dark:text-zinc-400">
                  {asset.type === 'Laptop' ? <IconLaptop className="w-6 h-6" /> : <IconMonitor className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{asset.name}</p>
                  <p className="text-xs text-zinc-500">Serial: {asset.serial} • Assigned: {asset.assignedDate}</p>
                </div>
              </div>
              <button onClick={() => handleRevokeAsset(asset.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Revoke Asset"><IconTrash className="w-4 h-4" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTransferLogsModal = () => {
    const totalDisbursed = logsData.reduce((acc, log) => acc + log.amount_paid, 0);
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50 dark:bg-black/20 p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
                <div className="flex gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Year</label>
                        <select 
                            value={logsYear} 
                            onChange={(e) => setLogsYear(parseInt(e.target.value))}
                            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Month</label>
                        <select 
                            value={logsMonth} 
                            onChange={(e) => setLogsMonth(parseInt(e.target.value))}
                            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Transfers</p>
                        <p className="text-lg font-black text-zinc-900 dark:text-white">{logsData.length}</p>
                    </div>
                    <div className="text-center md:text-right border-l border-zinc-200 dark:border-white/10 pl-4">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Net Outflow</p>
                        <p className="text-lg font-black text-emerald-600">{formatCurrency(totalDisbursed)}</p>
                    </div>
                </div>
            </div>

            <div className="border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-zinc-900/50">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase border-b border-zinc-100 dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4">Employee ID</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                        {logsLoading ? (
                            <tr><td colSpan={4} className="p-12 text-center text-zinc-400 italic">Scanning transaction database...</td></tr>
                        ) : logsData.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-zinc-400 italic">No disbursement records found for this period.</td></tr>
                        ) : (
                            logsData.map((log, i) => (
                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">#{log.employee_id}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{log.email}</td>
                                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{formatCurrency(log.amount_paid)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold uppercase text-[10px] tracking-wide border border-emerald-100 dark:border-emerald-500/20">
                                            {log.status}
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
  };

  const renderOnboardingForm = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-600 font-bold uppercase tracking-wide">
          <IconChevronLeft className="w-4 h-4" /> Back to Directory
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Employee Onboarding</h2>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section 1: Identity */}
           <div className="space-y-6">
              <h3 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2">Identity & Credentials</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newEmployee.full_name} 
                      onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all"
                      placeholder="e.g. John Doe"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Corporate Email</label>
                    <input 
                      type="email" 
                      value={newEmployee.email} 
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all"
                      placeholder="j.doe@company.ai"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Initial Password</label>
                    <input 
                      type="password" 
                      value={newEmployee.password} 
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Employee ID</label>
                    <input 
                      type="text" 
                      value={newEmployee.employee_id} 
                      onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-cyan-500 outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Deployment */}
           <div className="space-y-6">
              <h3 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2">Organizational Deployment</h3>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Department</label>
                       <select 
                         value={newEmployee.department} 
                         onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                         className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
                       >
                          <option value="Engineering">Engineering</option>
                          <option value="Product">Product</option>
                          <option value="Design">Design</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Marketing">Marketing</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Role Type</label>
                       <select 
                         value={newEmployee.role} 
                         onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                         className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
                       >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Administrator</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Designation / Title</label>
                    <input 
                      type="text" 
                      value={newEmployee.designation} 
                      onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all"
                      placeholder="e.g. Senior Software Engineer"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Reporting Manager</label>
                    <select 
                      value={newEmployee.manager_id} 
                      onChange={(e) => setNewEmployee({...newEmployee, manager_id: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
                    >
                       <option value="">Select Manager...</option>
                       {employees.map(emp => (
                         <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                       ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Joining Date</label>
                       <input 
                         type="date" 
                         value={newEmployee.join_date} 
                         onChange={(e) => setNewEmployee({...newEmployee, join_date: e.target.value})}
                         className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Work Location</label>
                       <input 
                         type="text" 
                         value={newEmployee.location} 
                         onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                         className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none"
                         placeholder="e.g. Remote"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-white/5 flex justify-end gap-3">
           <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-zinc-500 font-bold text-sm hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
           <button 
             onClick={handleAddEmployee} 
             disabled={loading}
             className="px-10 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-opacity flex items-center gap-2"
           >
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><IconCheckCircle className="w-4 h-4" /> Authorize Onboarding</>}
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative min-h-full">
      {showSuccess && <SuccessOverlay message={successMessage} />}
      
      <DisbursementStatusModal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
        data={processResult} 
        status={processStatus}
        errorMsg={processErrorMsg}
      />

      <BulkDisbursementStatusModal 
        isOpen={isBulkStatusModalOpen} 
        onClose={() => setIsBulkStatusModalOpen(false)} 
        data={bulkResult}
      />

      {/* Salary Disbursement Logs Modal */}
      <Modal 
        title="Salary Disbursement Registry" 
        isOpen={isLogsModalOpen} 
        onClose={() => setIsLogsModalOpen(false)}
        maxWidth="max-w-4xl"
      >
        {renderTransferLogsModal()}
      </Modal>

      <Modal title="Confirm Salary Disbursement" isOpen={isProcessConfirmOpen} onClose={() => setIsProcessConfirmOpen(false)}>
         <div className="space-y-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex gap-3">
               <IconAlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
               <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                  Select the Year and Month to process. Direct wire transfer will be initiated immediately upon confirmation.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Year</label>
                  <select value={processYear} onChange={(e) => setProcessYear(parseInt(e.target.value))} className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500" > {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)} </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Month</label>
                  <select value={processMonth} onChange={(e) => setProcessMonth(parseInt(e.target.value))} className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500" > {Array.from({ length: 12 }, (_, i) => i + 1).map(m => ( <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option> ))} </select>
               </div>
            </div>

            {(isAlreadyPaid(processMonth, processYear) || checkStatus?.has_paid_payslip) && ( <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30"> <IconAlertCircle className="w-4 h-4" /> Salary for this period has already been processed and paid. </div> )}

            <div className="pt-4">
               <button onClick={handleProcessSalary} disabled={isAlreadyPaid(processMonth, processYear) || checkStatus?.has_paid_payslip || historyLoading} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${ (isAlreadyPaid(processMonth, processYear) || checkStatus?.has_paid_payslip) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-300 dark:border-white/5' : 'bg-[#5f259f] text-white hover:bg-[#7d39c5]' }`} > {(isAlreadyPaid(processMonth, processYear) || checkStatus?.has_paid_payslip) ? ( <><IconCheckCircle className="w-4 h-4" /> Already Paid</> ) : ( <><IconSend className="w-5 h-5" /> {historyLoading ? 'Processing...' : 'Confirm & Pay Now'}</> )} </button>
            </div>
         </div>
      </Modal>

      <Modal title="Mass Organization Disbursement" isOpen={isBulkProcessConfirmOpen} onClose={() => setIsBulkProcessConfirmOpen(false)}>
         <div className="space-y-6">
            <div className="p-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-3xl flex gap-4">
               <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl shrink-0 h-fit">
                  <IconShield className="w-6 h-6 text-purple-600" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">Enterprise Security Protocol</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-400/80 mt-1 leading-relaxed">
                     You are about to initiate organization-wide wire transfers. This action will process the payroll for all eligible employees in the registry.
                  </p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payout Year</label>
                  <select value={processYear} onChange={(e) => setProcessYear(parseInt(e.target.value))} className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500" > {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)} </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payout Month</label>
                  <select value={processMonth} onChange={(e) => setProcessMonth(parseInt(e.target.value))} className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500" > {Array.from({ length: 12 }, (_, i) => i + 1).map(m => ( <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option> ))} </select>
               </div>
            </div>

            <div className="pt-4">
               <button onClick={handleBulkProcessSalary} disabled={historyLoading} className="w-full py-5 bg-gradient-to-r from-[#5f259f] to-[#3a0b74] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-[#5f259f]/40 transition-all flex items-center justify-center gap-3 transform active:scale-95" > {historyLoading ? ( <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> ) : ( <><IconSend className="w-5 h-5" /> Authorize Batch Transaction</> )} </button>
            </div>
         </div>
      </Modal>

      {isCreating ? ( 
        renderOnboardingForm()
      ) : isEditingSalary ? ( 
        renderSalaryStructurePage() 
      ) : isProcessingMonthly ? ( 
        renderMonthlyProcessingPage() 
      ) : selectedEmp ? (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
           <div className="flex items-center justify-between"> 
              <button onClick={() => setSelectedEmp(null)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-bold uppercase tracking-wide"> 
                <IconChevronLeft className="w-4 h-4" /> Back to Directory 
              </button> 
              <div className="flex gap-2"> 
                <button onClick={handleOpenSalaryStructure} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition-all text-xs font-bold shadow-lg shadow-cyan-500/20 transform active:scale-95"> 
                  <IconCash className="w-4 h-4" /> Salary Workspace 
                </button> 
                <button onClick={() => { setActiveTab('History'); setHistoryType('complete_log'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all text-xs font-bold shadow-sm"> 
                  <IconClock className="w-4 h-4" /> View History 
                </button> 
                <button onClick={() => handleAction('delete')} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm">
                  <IconTrash className="w-5 h-5" />
                </button> 
              </div> 
           </div>
           <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5"><IconUserCheck className="w-24 h-24" /></div>
             <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-2"> 
               <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">Today's Status</span> 
               {renderStatusBadge()} 
             </div> 
             <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10"> 
               <img src={selectedEmp.avatar} alt="" className="w-28 h-28 rounded-3xl border-4 border-white dark:border-zinc-800 shadow-2xl object-cover ring-1 ring-zinc-200 dark:ring-white/5" /> 
               <div className="flex-1 text-center md:text-left"> 
                 <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">{selectedEmp.name}</h1> 
                 <p className="text-zinc-500 text-lg font-medium flex items-center justify-center md:justify-start gap-2"> 
                   {selectedEmp.role} <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/30"></span> {selectedEmp.department} 
                 </p> 
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6"> 
                   <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-white/5"><IconMail className="w-4 h-4 text-cyan-500/70" /> {selectedEmp.email}</div> 
                   <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-white/5"><IconMapPin className="w-4 h-4 text-cyan-500/70" /> {selectedEmp.location}</div> 
                 </div> 
               </div> 
               <div className="flex flex-col items-end gap-3 shrink-0"> 
                 <span className={`px-6 py-2 rounded-2xl font-black text-[10px] border uppercase tracking-[0.2em] shadow-sm ${getStatusColor(selectedEmp.status)}`}>{selectedEmp.status?.replace(/[-_]/g, ' ')}</span> 
                 <p className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded">ID: {selectedEmp.employeeId}</p> 
               </div> 
             </div> 
             <div className="flex gap-8 mt-12 border-b border-zinc-200 dark:border-white/5 overflow-x-auto custom-scrollbar pb-1"> 
               {['Overview', 'Finance', 'Profile', 'Job', 'Documents', 'Assets', 'History'].map((tab) => ( 
                 <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`} > {tab} </button> 
               ))} 
             </div> 
           </div>
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"> {detailLoading ? ( <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div> ) : ( <> {activeTab === 'Overview' && renderOverview(selectedEmp)} {activeTab === 'Finance' && renderFinanceTab()} {activeTab === 'Profile' && renderProfileTab(selectedEmp)} {activeTab === 'Job' && renderJobTab(selectedEmp)} {activeTab === 'Documents' && renderDocumentsTab()} {activeTab === 'Assets' && renderAssetsTab()} {activeTab === 'History' && renderHistoryTab()} </> )} </div> </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500 h-full pb-10">
           {/* Refactored Header Section */}
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"> 
              <div className="space-y-1"> 
                  <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Workforce Hub</h1> 
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Enterprise directory with integrated payroll systems.</p> 
              </div> 
              <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-[24px] border border-zinc-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                  <button onClick={() => setIsLogsModalOpen(true)} className="px-5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 transition-all transform active:scale-95 group">
                      <IconHistory className="w-4 h-4 text-zinc-400 group-hover:text-cyan-500 transition-colors" /> Disbursement Registry
                  </button>
                  <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>
                  <button onClick={() => setIsBulkProcessConfirmOpen(true)} className="px-5 py-2.5 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2.5 transition-all transform active:scale-95 group">
                      <IconCash className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" /> Bulk Settlement
                  </button>
                  <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 group"> 
                      <IconPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Resource
                  </button> 
              </div>
           </div>

           {/* List Control Panel */}
           <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-all"> 
              <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex flex-col md:flex-row gap-4 bg-zinc-50/30 dark:bg-black/20"> 
                 <div className="relative flex-1 group"> 
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" /> 
                    <input type="text" placeholder="Filter registry by name, role or identifier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-zinc-400 transition-all" /> 
                 </div> 
                 <button onClick={fetchEmployees} className="px-6 py-3.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 flex items-center justify-center gap-2.5 transition-all active:scale-95"> 
                    <IconHistory className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Database 
                 </button> 
              </div> 
              
              <div className="overflow-x-auto flex-1"> 
                <table className="w-full text-left border-collapse"> 
                  <thead className="bg-zinc-50/50 dark:bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest sticky top-0 z-10 border-b border-zinc-100 dark:border-white/5"> 
                    <tr> 
                      <th className="px-8 py-5">Corporate Resource</th> 
                      <th className="px-8 py-5">Deployment</th> 
                      <th className="px-8 py-5">Current Status</th> 
                      <th className="px-8 py-5 text-right">Workflow</th> 
                    </tr> 
                  </thead> 
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5"> 
                    {loading ? ( 
                      <tr><td colSpan={4} className="p-20 text-center text-zinc-500 animate-pulse"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-[0.2em]">Accessing Directory...</p></div></td></tr> 
                    ) : error ? ( 
                      <tr><td colSpan={4} className="p-20 text-center"><div className="flex flex-col items-center gap-6 animate-in zoom-in-95"><div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-[30px] border border-red-100 dark:border-red-900/30"><IconAlertCircle className="w-10 h-10 text-red-500" /></div><div className="space-y-1"><p className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{error}</p></div><button onClick={fetchEmployees} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all shadow-xl">Reconnect</button></div></td></tr> 
                    ) : currentEmployees.length === 0 ? ( 
                      <tr><td colSpan={4} className="p-20 text-center text-zinc-400 italic">No records matching the current filter criteria were discovered in the registry.</td></tr> 
                    ) : ( 
                      currentEmployees.map((emp, i) => ( 
                        <tr key={emp.id} className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }} onClick={() => handleViewEmployee(emp)}> 
                          <td className="px-8 py-6"> 
                            <div className="flex items-center gap-5"> 
                              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0 shadow-sm group-hover:shadow-md transition-all"><img src={emp.avatar} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div> 
                              <div>
                                <p className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{emp.name}</p>
                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{emp.employeeId}</p>
                              </div> 
                            </div> 
                          </td> 
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{emp.role}</p>
                            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{emp.department}</p>
                          </td> 
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(emp.status)}`}>
                              {emp.status?.replace(/[-_]/g, ' ')}
                            </span>
                          </td> 
                          <td className="px-8 py-6 text-right"> 
                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-x-2 sm:group-hover:translate-x-0" onClick={e => e.stopPropagation()}> 
                              <button onClick={() => handleViewEmployee(emp, 'Finance')} className="p-2.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-400 hover:text-cyan-600 hover:border-cyan-500/50 shadow-sm transition-all" title="Settlement Protocol"><IconCash className="w-4 h-4" /></button> 
                              <button onClick={() => handleViewEmployee(emp, 'History')} className="p-2.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-400 hover:text-cyan-600 hover:border-cyan-500/50 shadow-sm transition-all" title="Audit History"><IconHistory className="w-4 h-4" /></button> 
                              <button onClick={() => handleViewEmployee(emp)} className="p-2.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-400 hover:text-cyan-600 hover:border-cyan-500/50 shadow-sm transition-all" title="Modify Record"><IconFileEdit className="w-4 h-4" /></button> 
                            </div> 
                          </td> 
                        </tr> 
                      )) 
                    )} 
                  </tbody> 
                </table> 
              </div> 

              <div className="p-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5"> 
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Showing index <span className="text-zinc-900 dark:text-white font-black">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)}</span> of <span className="text-zinc-900 dark:text-white font-black">{filteredEmployees.length}</span> records
                </p> 
                <div className="flex gap-2"> 
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-all shadow-sm active:scale-90"><IconChevronLeft className="w-5 h-5" /></button> 
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-all shadow-sm active:scale-90"><IconChevronRight className="w-5 h-5" /></button> 
                </div> 
              </div> 
           </div> 
        </div> 
      )}
    </div>
  );
};

export default AdminView;
