import type { ModuleOption, ModuleScope, ModuleGroup } from '../types/navigation.ts';

export function createModuleOption(
  moduleId: string,
  id: string,
  title: string,
  titleZh: string,
  description: string,
  descriptionZh: string,
  scope: ModuleScope,
  group: ModuleGroup,
  path: string,
  icon: string,
): ModuleOption {
  return {
    id: `${moduleId}-${scope}-${id}`,
    moduleId,
    title,
    titleZh,
    description,
    descriptionZh,
    scope,
    group,
    path,
    icon,
  };
}
