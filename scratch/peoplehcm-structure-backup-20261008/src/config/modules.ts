import {
  Clock3,
  CalendarDays,
  ReceiptText,
  WalletCards,
  UsersRound,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  LayoutDashboard,
  LayoutGrid,
  Star,
  Settings2,
} from 'lucide-react';

export const modules = [
  {
    id: 'attendance',
    en: 'Time & Attendance',
    zh: '时间与考勤',
    icon: Clock3,
    path: 'modules/attendance/index.html',
    description: 'Clocking, shifts, overtime and attendance.',
    descriptionZh: '打卡、排班、加班与考勤管理。',
  },
  {
    id: 'leave',
    en: 'Leave & Holidays',
    zh: '请假与假期',
    icon: CalendarDays,
    path: 'leave.html',
    description: 'Leave applications, balances and approvals.',
    descriptionZh: '请假申请、余额与审批。',
  },
  {
    id: 'claims',
    en: 'Claims & Expenses',
    zh: '报销与费用',
    icon: ReceiptText,
    path: 'modules/claims/index.html',
    description: 'Travel, benefits, medical and expense claims.',
    descriptionZh: '差旅、福利、医疗与费用报销。',
  },
  {
    id: 'payroll',
    en: 'Payroll & Compensation',
    zh: '薪资与报酬',
    icon: WalletCards,
    path: 'modules/payroll/index.html',
    description: 'Payslips, deductions, tax and pay history.',
    descriptionZh: '工资单、扣款、税务与薪资记录。',
  },
  {
    id: 'employee-career',
    en: 'Employee Career',
    zh: '员工发展',
    icon: UsersRound,
    path: 'modules/employee-career/index.html',
    description: 'Your people, development and employee lifecycle.',
    descriptionZh: '员工管理、发展与全周期流程。',
  },
  {
    id: 'project-task',
    en: 'Project & Task',
    zh: '项目与任务',
    icon: BriefcaseBusiness,
    path: 'modules/project-task/index.html',
    description: 'Work plans, assignments and timesheets.',
    descriptionZh: '工作计划、任务分配与工时表。',
  },
  {
    id: 'admin',
    en: 'Workplace',
    zh: '行政办公',
    icon: Building2,
    path: 'modules/admin/index.html',
    description: 'Resources, inventory, visitors and policies.',
    descriptionZh: '资源预约、物品申请、访客与规章。',
  },
  {
    id: 'profile',
    en: 'My Profile',
    zh: '个人资料',
    icon: CircleUserRound,
    path: 'me.html',
    description: 'Personal, employment and professional information.',
    descriptionZh: '个人信息、任职资料与专业记录。',
  },
] as const;

export const shellIcons = {
  dashboard: LayoutDashboard,
  apps: LayoutGrid,
  favourites: Star,
  settings: Settings2,
};
export interface PageRecord {
  path: string;
  title: string;
  titleZh: string;
  module: string;
  kind: string;
  fields: number;
}
