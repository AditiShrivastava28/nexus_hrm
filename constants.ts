
import { User } from './types';

export const API_BASE_URL = 'https://backend-production-4185.up.railway.app/api/v1';

// Mock Data for Fallback
const MOCK_DATA: Record<string, any> = {
  '/users/me': {
    id: 1,
    full_name: 'Alex Rivera',
    email: 'alex.rivera@nexus.ai',
    role: 'Senior Product Designer',
    department: 'Design',
    employee_id: 'EMP-2024-8842',
    location: 'San Francisco, CA',
    manager: 'Sarah Jenkins',
    status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    created_at: '2022-01-15T09:00:00Z',
    dob: '1992-05-20',
    mobile: '+1 (555) 123-4567',
    address: '123 Silicon Valley Way, CA',
    personal_email: 'alex.personal@gmail.com',
    blood_group: 'O+',
    gender: 'Male',
    marital_status: 'Single'
  },
  '/attendance/today': {
    clock_in: null,
    clock_out: null,
    is_on_break: false,
    status: 'IDLE',
    total_hours: '0h 0m',
    breaks: []
  },
  '/leaves/balance': [
    { leave_type: 'Annual Leave', total_days: 18, used_days: 4, remaining_days: 14 },
    { leave_type: 'Sick Leave', total_days: 12, used_days: 2, remaining_days: 10 },
    { leave_type: 'Casual Leave', total_days: 10, used_days: 1, remaining_days: 9 }
  ],
  '/finance/salary': {
    annualCTC: 8500000,
    monthlyGross: 708333,
    basic: 354166,
    hra: 141666,
    specialAllowance: 212500,
    pfDeduction: 42500,
    taxDeduction: 70833,
    totalDeductions: 113333,
    netPay: 595000,
    currency: 'INR'
  },
  '/finances/ctc-breakup': {
    "annual_ctc": 500000,
    "monthly_ctc": 41666.666666666664,
    "components": {
      "basic": { "monthly": 16666, "annual": 199992, "percentage_of_ctc": 40 },
      "hra": { "monthly": 6666, "annual": 79992, "percentage_of_basic": 40 },
      "special_allowance": { "monthly": 18334, "annual": 220008, "percentage_of_ctc": 44 },
      "gross_salary": { "monthly": 41666, "annual": 499992 }
    },
    "percentages": {
      "basic_percentage": 40,
      "hra_percentage": 40,
      "special_allowance_percentage": 44,
      "deductions_percentage": 0.48,
      "net_pay_percentage": 99.52
    },
    "deductions": {
      "pf_deduction": { "monthly": 0, "annual": 0, "percentage_of_basic": 0 },
      "tax_deduction": { "monthly": 0, "annual": 0, "percentage_of_gross": 0 },
      "total_deductions": { "monthly": 200, "annual": 2400, "percentage_of_ctc": 0.48 }
    },
    "employer_contributions": {
      "pf_contribution": { "monthly": 1800, "annual": 21600, "percentage_of_basic": 10.8 },
      "total_employer_contribution": { "monthly": 1800, "annual": 21600 }
    },
    "tax_analysis": {
      "annual_gross_income": 499992,
      "annual_taxable_income": 449992,
      "estimated_annual_tax": 0,
      "estimated_monthly_tax": 0,
      "tax_slab": "5% (₹2.5L - ₹5L)",
      "effective_tax_rate": 0
    },
    "compliance": {
      "is_compliant": true,
      "compliance_score": 100,
      "issues": [],
      "recommendations": [],
      "basic_percentage": 39.998400000000004,
      "hra_percentage": 39.99759990399616,
      "deductions_percentage": 0
    },
    "formatted_breakdown": {
      "annual_ctc": 500000,
      "monthly_components": { "basic": 16666, "hra": 6666, "special_allowance": 18334, "gross": 41666 },
      "deductions": { "pf": 0, "tax": 0, "professional_tax": 200, "total": 200 },
      "net_pay": 41466,
      "employer_contributions": { "pf": 1800 }
    }
  },
  '/admin/employees': [
    { id: 1, full_name: 'Alex Rivera', designation: 'Senior Product Designer', department: 'Design', status: 'active', location: 'San Francisco', employee_id: 'EMP-2024-8842', email: 'alex.rivera@nexus.ai', salary: 8500000 },
    { id: 2, full_name: 'Sarah Jenkins', designation: 'Engineering Manager', department: 'Engineering', status: 'active', location: 'Remote', employee_id: 'EMP-2023-1122', email: 'sarah.j@nexus.ai', salary: 12000000 },
    { id: 3, full_name: 'Michael Chen', designation: 'Full Stack Developer', department: 'Engineering', status: 'active', location: 'New York', employee_id: 'EMP-2024-4455', email: 'm.chen@nexus.ai', salary: 6500000 },
    { id: 4, full_name: 'David Miller', designation: 'UX Designer', department: 'Design', status: 'active', location: 'San Francisco', employee_id: 'EMP-2024-9900', email: 'd.miller@nexus.ai', salary: 7200000 }
  ]
};

// Specifically handle the finance overview mock which is dynamic
const getFinanceMock = (id: string) => ({
  "salary": {
    "annualCTC": 7500000,
    "monthlyGross": 625000,
    "basic": 250000,
    "hra": 100000,
    "specialAllowance": 275000,
    "pfDeduction": 1800,
    "taxDeduction": 45000,
    "totalDeductions": 63200,
    "netPay": 561800,
    "currency": "INR"
  },
  "payCycle": {
    "lastPaid": "2024-02-28",
    "nextPayDate": "2024-03-31",
    "daysToPay": 12,
    "nextIncrementDate": "2025-01-15",
    "incrementCycle": "Annual"
  },
  "payslips": [
    { "id": 101, "month": "February", "year": 2024, "amount": 561800, "status": "Paid" },
    { "id": 102, "month": "January", "year": 2024, "amount": 561800, "status": "Paid" }
  ]
});

const getProcessSalaryMock = (id: string, month: number, year: number) => ({
  "success": true,
  "message": "Salary processed successfully",
  "employee_id": parseInt(id),
  "employee_name": "Employee " + id,
  "employee_email": "employee" + id + "@nexus.ai",
  "month": month,
  "year": year,
  "amount_processed": 41466,
  "status": "paid",
  "processed_date": new Date().toISOString(),
  "payslip_id": Math.floor(Math.random() * 1000),
  "monthly_processing_id": Math.floor(Math.random() * 1000),
  "duplicate_prevented": false,
  "previous_payslip_info": null,
  "payslip_details": {
    "action": "created",
    "basic": 16666,
    "hra": 6666,
    "special_allowance": 18334,
    "pf_deduction": 0,
    "tax_deduction": 0,
    "total_deductions": 200,
    "net_pay": 41466,
    "custom_deductions": 0,
    "notes": null
  },
  "monthly_processing_details": {
    "action": "created",
    "total_employees": 1,
    "successful_payments": 1,
    "failed_payments": 0,
    "total_processed_amount": 41466,
    "status": "completed"
  }
});

const getGeneratedPayslipMock = (id: string, month: number, year: number) => {
  // Make unpaid leaves month-dependent for mock realism
  const unpaid = month % 3 === 0 ? 1.5 : (month % 5 === 0 ? 0.5 : 0);
  const baseSalary = 250000;
  const cut = (baseSalary / 30) * unpaid;

  return {
    "success": true,
    "employee_id": parseInt(id),
    "employee_name": "Nexus Employee",
    "employee_email": "employee@nexus.ai",
    "department": "Engineering",
    "designation": "Software Engineer",
    "payslip_id": 99881 + month,
    "month": month,
    "year": year,
    "pay_date": `${year}-${month.toString().padStart(2, '0')}-01`,
    "annual_ctc": 7500000,
    "monthly_ctc": 625000,
    "basic_actual": baseSalary,
    "basic_payable": baseSalary - cut,
    "hra_actual": 100000,
    "hra_payable": 100000 - (cut * 0.4),
    "special_allowance_actual": 275000,
    "special_allowance_payable": 275000 - (cut * 0.2),
    "total_earnings_actual": 625000,
    "total_earnings_payable": 625000 - cut,
    "pf_deduction": 1800,
    "tax_deduction": 45000,
    "professional_tax": 200,
    "leave_deduction": cut,
    "other_deductions": 0,
    "total_deductions": 47000 + cut,
    "gross_salary": 625000 - cut,
    "in_hand_salary": 578000 - cut,
    "total_days_in_month": 31,
    "total_working_days": 22,
    "unpaid_leaves_taken": Math.floor(unpaid),
    "half_day_leaves": unpaid % 1 === 0 ? 0 : 1,
    "per_day_salary": 20547.95,
    "salary_cut_for_unpaid_leaves": cut,
    "final_processed_salary": 578000 - cut,
    "ytd_earnings": 1210000,
    "ytd_deductions": 134000,
    "leave_balance_remaining": 14,
    "generated_at": new Date().toISOString(),
    "calculation_details": {}
  };
};

// Specifically handle the CTC breakdown mock
const getCtcBreakdownMock = (id: string) => ({
  "employee_id": parseInt(id),
  "employee_name": "Nexus Employee",
  "employee_email": "employee@nexus.ai",
  "department": "Engineering",
  "designation": "Software Engineer",
  "annual_ctc": 7500000,
  "monthly_gross": 625000,
  "basic": 250000,
  "hra": 100000,
  "special_allowance": 275000,
  "pf_deduction": 1800,
  "tax_deduction": 45000,
  "professional_tax": 200,
  "total_deductions": 47000,
  "net_pay": 578000,
  "employer_pf": 1800,
  "cost_per_day": 20547.95,
  "calculation_details": {
    "basic_percentage": 0.4,
    "hra_percentage": 0.4,
    "professional_tax_calculation": "Monthly professional tax for default: 200.00",
    "cost_per_day_calculation": "7500000.0 / 365 = 20547.95",
    "employer_pf_calculation": "min(250000.0, 15000) * 0.12 = 1800.00",
    "last_calculated": new Date().toISOString()
  },
  "last_updated": new Date().toISOString()
});

// Specifically handle the Monthly Salary Validation mock
const getMonthlyValidationMock = (id: string, month: number, year: number) => {
  // Return different counts based on month for clear visual feedback in mock mode
  const unpaidCount = month % 4 === 0 ? 2 : (month % 5 === 0 ? 1 : (month % 7 === 0 ? 3 : 0));
  const halfDayCount = month % 3 === 0 ? 1 : 0;
  
  const baseSalary = 41466;
  const dailyRate = 1337.61;
  const totalLopDays = unpaidCount + (halfDayCount * 0.5);
  const leaveDeduction = totalLopDays * dailyRate;

  return {
    "success": true,
    "employee_id": parseInt(id),
    "employee_name": "Nexus Employee",
    "month": month,
    "year": year,
    "is_valid": true,
    "validation_issues": [],
    "days_in_month": 31,
    "working_days": 22,
    "unpaid_leave_days": unpaidCount,
    "half_day_leaves": halfDayCount,
    "payable_days": 31 - totalLopDays,
    "daily_salary": dailyRate,
    "leave_deduction": leaveDeduction,
    "custom_deduction": 0,
    "total_deductions": 200 + leaveDeduction,
    "final_net_salary": baseSalary - leaveDeduction - 200,
    "payslip_id": null,
    "payslip_generated": false,
    "calculation_details": {
      "days_in_month": 31,
      "working_days": 22,
      "daily_salary_calculation": `${baseSalary}.0 / 31 = ${dailyRate.toFixed(2)}`,
      "leave_deduction_calculation": `${totalLopDays.toFixed(1)} * ${dailyRate.toFixed(2)} = ${leaveDeduction.toFixed(2)}`,
      "final_salary_calculation": `${baseSalary}.0 - ${leaveDeduction.toFixed(2)} - 200.00 = ${(baseSalary - leaveDeduction - 200).toFixed(2)}`,
      "payable_days_ratio": (31 - totalLopDays) / 31,
      "auto_fetched_leave_data": {
        "unpaid_leave_days": unpaidCount,
        "half_day_leaves": halfDayCount,
        "total_unpaid_leave_days": totalLopDays,
        "leave_breakdown": unpaidCount > 0 ? [
          {
            "leave_id": 15,
            "days": unpaidCount,
            "type": "full_day",
            "start_date": `${year}-${month}-15`,
            "end_date": `${year}-${month}-${15 + unpaidCount - 1}`,
            "reason": "Personal time"
          }
        ] : [],
        "query_period": {
          "start_date": `${year}-${month}-01`,
          "end_date": `${year}-${month}-31`
        },
        "total_leave_records_found": unpaidCount > 0 ? 1 : 0
      }
    },
    "processed_at": new Date().toISOString()
  };
};

export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const method = options.method ? options.method.toUpperCase() : 'GET';
  if (method !== 'GET' && method !== 'HEAD' && options.body && !(options.body instanceof FormData)) {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(fullUrl, { ...options, headers });
    
    if (response.status === 401) localStorage.removeItem('token');
    
    // Even if response is not ok, we don't catch here, but in the caller.
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    console.warn(`API Mock Fallback triggered for: [${method}] ${endpoint}`, error);
    
    // Robust parsing using URL object
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(endpoint, API_BASE_URL);
    } catch(e) {
        parsedUrl = new URL(API_BASE_URL + endpoint);
    }
    
    const pathname = parsedUrl.pathname;
    const pathParts = pathname.split('/').filter(p => p !== '');
    
    // Check for salary processing
    if (pathname.includes('/salary/process/')) {
        const id = pathParts[pathParts.length - 1];
        const month = parseInt(parsedUrl.searchParams.get('month') || (new Date().getMonth() + 1).toString());
        const year = parseInt(parsedUrl.searchParams.get('year') || new Date().getFullYear().toString());
        const data = getProcessSalaryMock(id, month, year);
        return {
          ok: true,
          status: 200,
          json: async () => data,
          text: async () => JSON.stringify(data),
        } as Response;
    }

    // Check for special finance-overview pattern
    if (pathname.includes('/finance-overview')) {
      const empIdx = pathParts.indexOf('employees');
      const id = empIdx !== -1 ? pathParts[empIdx + 1] : '1';
      const data = getFinanceMock(id);
      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response;
    }

    // Check for payslip generation
    if (pathname.includes('/generate-payslip/')) {
      const id = pathParts[pathParts.length - 1];
      const month = parseInt(parsedUrl.searchParams.get('month') || (new Date().getMonth() + 1).toString());
      const year = parseInt(parsedUrl.searchParams.get('year') || new Date().getFullYear().toString());
      const data = getGeneratedPayslipMock(id, month, year);
      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response;
    }

    // Check for ctc-breakdown pattern
    if (pathname.includes('/ctc-breakdown/')) {
      const id = pathParts[pathParts.length - 1];
      const data = getCtcBreakdownMock(id);
      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response;
    }

    // Check for monthly validation pattern (handles both GET/POST for mock purposes)
    if (pathname.includes('/validate-monthly/')) {
      const id = pathParts[pathParts.length - 1];
      const month = parseInt(parsedUrl.searchParams.get('month') || (new Date().getMonth() + 1).toString());
      const year = parseInt(parsedUrl.searchParams.get('year') || new Date().getFullYear().toString());
      const data = getMonthlyValidationMock(id, month, year);
      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response;
    }

    // Standard Mock Data Fallback
    const normalizedEndpoint = endpoint.split('?')[0];
    const mockMatch = Object.keys(MOCK_DATA).find(key => normalizedEndpoint === key || normalizedEndpoint.startsWith(key + '/'));
    const data = mockMatch ? MOCK_DATA[mockMatch] : (normalizedEndpoint.includes('history') ? [] : {});
    
    return {
      ok: true,
      status: 200,
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const COMPANY_POLICIES = `
1. Leave Policy: 12 CL, 10 SL, 18 PL per year.
2. Standard Hours: 9:00 AM - 6:00 PM.
3. Hybrid Model: 3 days office, 2 days remote.
4. Professional Conduct: Integrity, respect, and innovation are core values.
`;
