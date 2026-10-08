import type { ModuleOption, ModuleScope } from '../../shared/types/navigation.ts';
import { attendanceNavigation } from '../../features/attendance/navigation.ts';
import { leaveNavigation } from '../../features/leave/navigation.ts';
import { claimsNavigation } from '../../features/claims/navigation.ts';
import { payrollNavigation } from '../../features/payroll/navigation.ts';
import { employeeCareerNavigation } from '../../features/employee-career/navigation.ts';
import { projectTaskNavigation } from '../../features/project-task/navigation.ts';
import { adminNavigation } from '../../features/admin/navigation.ts';
import { profileNavigation } from '../../features/profile/navigation.ts';

export const moduleOverviewPaths: Record<string, string> = {
  attendance: 'modules/attendance/index.html',
  leave: 'leave.html',
  claims: 'modules/claims/index.html',
  payroll: 'modules/payroll/index.html',
  'employee-career': 'modules/employee-career/index.html',
  'project-task': 'modules/project-task/index.html',
  admin: 'modules/admin/index.html',
  profile: 'me.html',
};

/** All source-derived module entries, in their unchanged original order. */
export const moduleNavigation: ModuleOption[] = [
  ...attendanceNavigation,
  ...leaveNavigation,
  ...claimsNavigation,
  ...payrollNavigation,
  ...employeeCareerNavigation,
  ...projectTaskNavigation,
  ...adminNavigation,
  ...profileNavigation,
];

/** Shared options appear in either scope; omitting scope returns the whole module. */
export function getModuleOptions(moduleId: string, scope?: ModuleScope): ModuleOption[] {
  return moduleNavigation.filter(
    (item) =>
      item.moduleId === moduleId && (!scope || item.scope === scope || item.scope === 'shared'),
  );
}
