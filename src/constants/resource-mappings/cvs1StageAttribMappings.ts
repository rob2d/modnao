import { ResourceAttribs } from '@/types';

const cvs1StageBaseAttribs = {
  game: 'CVS1Pro',
  name: 'Stage File (unspecified)',
  resourceType: 'cvs1-stage',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const cvs1StageAttribMappings = {
  '6971c7f91ff9f0f83b771609451e49d7814b5388': {
    ...cvs1StageBaseAttribs,
    name: 'Stage 00/0B',
    identifier: 'STG00/STG0B',
    filenamePattern: '^STG(00|0B)(.mn)?POL.BIN$'
  },
  c914cac667b9d564479b256f378eb7bf95997ec3: {
    ...cvs1StageBaseAttribs,
    name: 'Stage 02',
    identifier: 'STG02',
    filenamePattern: '^STG02(.mn)?POL.BIN$'
  },
  '7a3438fef9b108f5e5c904c51e4b2b29d0be0bff': {
    ...cvs1StageBaseAttribs,
    name: 'Stage 04',
    identifier: 'STG04',
    filenamePattern: '^STG04(.mn)?POL.BIN$'
  },
  a3b52397da2e4011c12939fd4ff59432600434ed: {
    ...cvs1StageBaseAttribs,
    name: 'Stage 05',
    identifier: 'STG05',
    filenamePattern: '^STG05(.mn)?POL.BIN$'
  },
  '076811481292fdea66848bc344bdc9201df7df59': {
    ...cvs1StageBaseAttribs,
    name: 'Stage 07',
    identifier: 'STG07',
    filenamePattern: '^STG07(.mn)?POL.BIN$'
  },
  fd5ff139f281e7a016bb8ece18b70816d3928934: {
    ...cvs1StageBaseAttribs,
    name: 'Stage 0C',
    identifier: 'STG0C',
    filenamePattern: '^STG0C(.mn)?POL.BIN$'
  }
} as const;

export default cvs1StageAttribMappings;
