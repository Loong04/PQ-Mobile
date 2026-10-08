export type ModuleScope = 'individual' | 'team' | 'shared';
export type ModuleGroup =
  | 'requests'
  | 'records'
  | 'approvals'
  | 'reports'
  | 'planning'
  | 'information';

export interface ModuleOption {
  id: string;
  moduleId: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  scope: ModuleScope;
  group: ModuleGroup;
  path: string;
  icon: string;
}

export interface PageRecord {
  path: string;
  title: string;
  titleZh: string;
  module: string;
  kind: string;
  fields: number;
}
