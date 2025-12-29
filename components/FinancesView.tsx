
import React, { useState, useEffect } from 'react';
import { formatCurrency, authenticatedFetch } from '../constants';
import { IconDownload, IconFileText, IconWallet, IconCalendar, IconBulb, IconCheckCircle, IconAlertCircle, IconCash, IconShield, IconSparkles } from './Icons';
import { Payslip, User } from '../types';

interface CTCBreakup {
  annual_ctc: number;
  monthly_ctc: number;
  components: {
    basic: { monthly: number; annual: number; percentage_of_ctc: number };
    hra: { monthly: number; annual: number; percentage_of_basic: number };
    special_allowance: { monthly: number; annual: number; percentage_of_ctc: number };
    gross_salary: { monthly: number; annual: number };
  };
  deductions: {
    pf_deduction: { monthly: number; annual: number };
    tax_deduction: { monthly: number; annual: number };
    total_deductions: { monthly: number; annual: number };
  };
  employer_contributions: {
    pf_contribution: { monthly: number; annual: number };
    total_employer_contribution: { monthly: number; annual: number };
  };
  tax_analysis: {
    tax_slab: string;
    estimated_annual_tax: number;
  };
  compliance: {
    is_compliant: boolean;
    compliance_score: number;
  };
  formatted_breakdown: {
    net_pay: number;
  };
}

interface MonthlyBreakdown {
  success: boolean;
  month: number;
  year: number;
  is_valid: boolean;
  days_in_month: number;
  working_days: number;
  unpaid_leave_days: number;
  payable_days: number;
  daily_salary: number;
  leave_deduction: number;
  custom_deduction: number;
  total_deductions: number;
  final_net_salary: number;
  calculation_details: {
    daily_salary_calculation: string;
    leave_deduction_calculation: string;
    final_salary_calculation: string;
  };
}

const InfoCard = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm dark:shadow-lg hover:border-cyan-500/20 transition-all duration-300 ${className}`}>
    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 font-mono">{title}</h3>
    {children}
  </div>
);

const FinancesView: React.FC<{ user: User | null }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [ctcBreakup, setCtcBreakup] = useState<CTCBreakup | null>(null);
  
  // Monthly Validation State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [breakdown, setBreakdown] = useState<MonthlyBreakdown | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [payslipsRes, ctcRes] = await Promise.all([
          authenticatedFetch('/finance/payslips'),
          authenticatedFetch('/finances/ctc-breakup')
        ]);

        if (payslipsRes.ok) {
          const payslipsData = await payslipsRes.json();
          setPayslips(Array.isArray(payslipsData) ? payslipsData : []);
        }

        if (ctcRes.ok) {
          const ctcData = await ctcRes.json();
          setCtcBreakup(ctcData);
        }
      } catch (error) {
        console.error("Failed to load finance data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMonthlyBreakdown = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const res = await authenticatedFetch(`/salary/validate-monthly/${user.id}?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setBreakdown(data);
      } else {
        alert("Could not fetch processing details for selected period.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadFile = (fileName: string) => alert(`Downloading ${fileName}...`);

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading payroll documents...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">My Finances</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Access your compensation structure and payslips</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/20 font-mono">
            FY {new Date().getFullYear()}-{new Date().getFullYear()+1}
          </span>
        </div>
      </div>

      {/* CTC BREAKUP SECTION */}
      {ctcBreakup && (
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <IconCash className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Compensation Breakdown</h3>
                    <p className="text-xs text-zinc-500">Your annual salary package and components</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Annual CTC</p>
                 <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(ctcBreakup.annual_ctc)}</p>
              </div>
           </div>

           <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Earnings Components */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5">
                             <th className="py-3">Salary Component</th>
                             <th className="py-3">Calculation</th>
                             <th className="py-3">Monthly</th>
                             <th className="py-3 text-right">Annual</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                          <tr className="group">
                             <td className="py-4">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Basic Salary</p>
                                <p className="text-[10px] text-zinc-500">Core component</p>
                             </td>
                             <td className="py-4 text-xs text-zinc-500 font-medium">40% of CTC</td>
                             <td className="py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{formatCurrency(ctcBreakup.components.basic.monthly)}</td>
                             <td className="py-4 text-sm font-mono font-bold text-zinc-900 dark:text-white text-right">{formatCurrency(ctcBreakup.components.basic.annual)}</td>
                          </tr>
                          <tr className="group">
                             <td className="py-4">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">House Rent Allowance</p>
                                <p className="text-[10px] text-zinc-500">HRA</p>
                             </td>
                             <td className="py-4 text-xs text-zinc-500 font-medium">40% of Basic</td>
                             <td className="py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{formatCurrency(ctcBreakup.components.hra.monthly)}</td>
                             <td className="py-4 text-sm font-mono font-bold text-zinc-900 dark:text-white text-right">{formatCurrency(ctcBreakup.components.hra.annual)}</td>
                          </tr>
                          <tr className="group">
                             <td className="py-4">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Special Allowance</p>
                                <p className="text-[10px] text-zinc-500">Balancing component</p>
                             </td>
                             <td className="py-4 text-xs text-zinc-500 font-medium">Residual</td>
                             <td className="py-4 text-sm font-mono text-zinc-700 dark:text-zinc-300">{formatCurrency(ctcBreakup.components.special_allowance.monthly)}</td>
                             <td className="py-4 text-sm font-mono font-bold text-zinc-900 dark:text-white text-right">{formatCurrency(ctcBreakup.components.special_allowance.annual)}</td>
                          </tr>
                          <tr className="bg-zinc-50/50 dark:bg-white/5">
                             <td className="py-4 pl-3" colSpan={2}>
                                <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">Gross Salary</p>
                             </td>
                             <td className="py-4 text-sm font-mono font-black text-cyan-600 dark:text-cyan-400">{formatCurrency(ctcBreakup.components.gross_salary.monthly)}</td>
                             <td className="py-4 pr-3 text-sm font-mono font-black text-cyan-600 dark:text-cyan-400 text-right">{formatCurrency(ctcBreakup.components.gross_salary.annual)}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 {/* Deductions Small Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                       <h4 className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-4">Statutory Deductions</h4>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="text-zinc-600 dark:text-zinc-400">Professional Tax</span>
                             <span className="font-bold text-red-600">-{formatCurrency(200)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="text-zinc-600 dark:text-zinc-400">Income Tax (TDS)</span>
                             <span className="font-bold text-red-600">-{formatCurrency(ctcBreakup.deductions.tax_deduction.monthly)}</span>
                          </div>
                          <div className="pt-2 border-t border-red-200 dark:border-red-900/30 flex justify-between font-black text-sm">
                             <span className="text-red-800 dark:text-red-300">Total Deductions</span>
                             <span className="text-red-800 dark:text-red-300">-{formatCurrency(ctcBreakup.deductions.total_deductions.monthly)}</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-5 bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl">
                       <h4 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-4">Employer Contributions</h4>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="text-zinc-600 dark:text-zinc-400">EPF Contribution</span>
                             <span className="font-bold text-indigo-600">{formatCurrency(ctcBreakup.employer_contributions.pf_contribution.monthly)}</span>
                          </div>
                          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-900/30 flex justify-between font-black text-sm">
                             <span className="text-indigo-800 dark:text-indigo-300">Net Benefits</span>
                             <span className="text-indigo-800 dark:text-indigo-300">{formatCurrency(ctcBreakup.employer_contributions.total_employer_contribution.monthly)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Sidebar Analysis */}
              <div className="space-y-6">
                 <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[32px] p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><IconSparkles className="w-12 h-12 text-emerald-500" /></div>
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4">Net Monthly Take-home</p>
                    <p className="text-4xl font-black text-emerald-800 dark:text-white tabular-nums tracking-tighter">{formatCurrency(ctcBreakup.formatted_breakdown.net_pay)}</p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-white dark:bg-black/20 py-2 rounded-full px-4 border border-emerald-200 dark:border-white/5">
                       <IconShield className="w-3.5 h-3.5" /> VERIFIED STRUCTURE
                    </div>
                 </div>

                 <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-6 border border-zinc-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                       <IconBulb className="w-4 h-4 text-amber-500" />
                       <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tax Analysis</h4>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500">Tax Slab</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{ctcBreakup.tax_analysis.tax_slab}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500">Compliance Score</span>
                          <span className="font-bold text-emerald-600">{ctcBreakup.compliance.compliance_score}%</span>
                       </div>
                    </div>
                    <div className="mt-6 p-3 bg-white dark:bg-black/40 rounded-xl border border-zinc-100 dark:border-white/5">
                       <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">AI Recommendation</p>
                       <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">Your structure is fully compliant with local labor laws. Ensure you declare your investments by Q3 for tax optimization.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Monthly Salary Processing Section */}
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-500">
         <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <IconCalendar className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Monthly Payout Breakdown</h3>
                  <p className="text-xs text-zinc-500">View detailed salary calculation logic for any month.</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
               <select 
                 value={selectedMonth} 
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
               >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                     <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
               </select>
               <select 
                 value={selectedYear} 
                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                 className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
               >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
               <button 
                 onClick={fetchMonthlyBreakdown}
                 disabled={analyzing}
                 className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
               >
                  {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Analyze Payout'}
               </button>
            </div>
         </div>

         {breakdown ? (
            <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Calendar Days</p>
                     <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{breakdown.days_in_month}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                     <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Payable Days</p>
                     <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{breakdown.payable_days}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                     <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Unpaid Leaves</p>
                     <p className="text-xl font-bold text-red-700 dark:text-red-300">{breakdown.unpaid_leave_days}</p>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                     <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest mb-1">Daily Rate</p>
                     <p className="text-xl font-bold text-cyan-800 dark:text-white">{formatCurrency(breakdown.daily_salary)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-100 dark:border-white/5">Payout Summary</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Unpaid Leave Deduction</span>
                              <span className="font-bold text-red-600">-{formatCurrency(breakdown.leave_deduction)}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Custom Deductions</span>
                              <span className="font-bold text-red-600">-{formatCurrency(breakdown.custom_deduction)}</span>
                           </div>
                           <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-white/5">
                              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                 <div>
                                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Net Monthly Salary</p>
                                    <p className="text-3xl font-bold text-emerald-800 dark:text-white">{formatCurrency(breakdown.final_net_salary)}</p>
                                 </div>
                                 <div className={`p-2 rounded-full ${breakdown.is_valid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {breakdown.is_valid ? <IconCheckCircle className="w-8 h-8" /> : <IconAlertCircle className="w-8 h-8" />}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-6 border border-zinc-100 dark:border-white/5">
                     <div className="flex items-center gap-2 mb-4">
                        <IconBulb className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Calculation Log</h4>
                     </div>
                     <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-100 dark:border-white/5">
                           <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Rate Logic</p>
                           <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{breakdown.calculation_details.daily_salary_calculation}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-100 dark:border-white/5">
                           <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Leave Deduction Logic</p>
                           <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{breakdown.calculation_details.leave_deduction_calculation}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-100 dark:border-white/5">
                           <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Final Payout Logic</p>
                           <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{breakdown.calculation_details.final_salary_calculation}</p>
                        </div>
                     </div>
                     <p className="mt-4 text-[10px] text-zinc-400 italic">Formula: Final Salary = (Fixed Gross) - (Unpaid Leaves * Daily Rate) - (Taxes/Custom)</p>
                  </div>
               </div>
            </div>
         ) : (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconWallet className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
               </div>
               <p className="text-zinc-500 dark:text-zinc-400 font-medium">Select a period to see your payout breakdown.</p>
               <p className="text-xs text-zinc-400 mt-1">We'll fetch and analyze your attendance, leaves, and standard salary structure.</p>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="Quick Access" className="md:col-span-1">
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-cyan-500 transition-colors">
              <span className="text-sm font-medium">Form 16</span>
              <IconDownload className="w-4 h-4 text-zinc-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-cyan-500 transition-colors">
              <span className="text-sm font-medium">PF Statement</span>
              <IconDownload className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </InfoCard>

        <InfoCard title="Payslip History" className="md:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-200 dark:border-white/5 uppercase tracking-wider">
                  <th className="py-3 font-medium pl-2">Month</th>
                  <th className="py-3 font-medium">Year</th>
                  <th className="py-3 font-medium">Net Pay</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-zinc-500">No recent payslips found.</td></tr>
                ) : (
                  payslips.map((payslip) => (
                    <tr key={payslip.id} className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-b border-zinc-200 dark:border-white/5 last:border-0">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 border border-zinc-200 dark:border-white/5"><IconFileText className="w-4 h-4" /></div>
                          <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{payslip.month}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-zinc-500 dark:text-zinc-400 font-mono">{payslip.year}</td>
                      <td className="py-4 text-sm text-zinc-800 dark:text-white font-mono">{formatCurrency(payslip.amount)}</td>
                      <td className="py-4">
                         <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded uppercase tracking-wide font-bold">{payslip.status}</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button 
                          onClick={() => downloadFile(`Payslip_${payslip.month}_${payslip.year}.pdf`)} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/40 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-cyan-500/30 transition-all text-xs font-medium"
                        >
                           <IconDownload className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default FinancesView;
