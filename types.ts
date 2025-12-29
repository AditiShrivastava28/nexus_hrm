
export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  employeeId: string;
  department: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Objective' | 'Key Result' | 'Personal';
  progress: number;
  dueDate: string;
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
}

export interface PayCycle {
  lastPaid: string;
  nextPayDate: string;
  daysToPay: number;
  nextIncrementDate: string;
  incrementCycle: string;
}

export interface Payslip {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: 'Paid' | 'Processing';
}

export enum NavItem {
  HOME = 'Home',
  ME = 'Me',
  INBOX = 'Inbox',
  TEAM = 'My Team',
  FINANCES = 'My Finances',
  PERFORMANCE = 'Performance',
  ORG = 'Org',
  RESUME = 'Resume Builder',
  ADMIN = 'Admin Portal',
  SETTINGS = 'Settings'
}
