import type { ResourceAttribs } from '@/types';

const resourceTypeNameMap = {
  'mvc2-stage': 'Stage',
  'cvs1-stage': 'Stage',
  'cvs1-demo': 'Demo Model',
  'cvs1-menu': 'Menu',
  'cvs2-stage': 'Stage',
  'cvs2-menu': 'Menu',
  'mvc2-menu': 'Menu',
  'vs2-stage': 'Stage',
  'vs2-demo': 'Demo Model'
} as const satisfies Record<ResourceAttribs['resourceType'], string>;

export default resourceTypeNameMap;
