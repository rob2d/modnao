const cvs2StageAttribBase = {
  game: 'CVS2',
  resourceType: 'cvs2-stage',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} as const;

const cvs2StageAttribMappings = {
  '83aef61df078d05a56c44ab094fef15c315b8df4': {
    ...cvs2StageAttribBase,
    name: 'Aomori, Japan',
    identifier: '0x00',
    filenamePattern: '^STG00(.mn)?POL.BIN$'
  },
  '62bfffa388a1139808689885d28caf262d36dead': {
    ...cvs2StageAttribBase,
    name: 'Shanghai, China',
    identifier: '0x01',
    filenamePattern: '^STG01(.mn)?POL.BIN$'
  },
  '38439dd57683f0b32376f2e894776ee610d24b3f': {
    ...cvs2StageAttribBase,
    name: 'Nairobi, Kenya',
    identifier: '0x02',
    filenamePattern: '^STG02(.mn)?POL.BIN$'
  },
  abb5450a23b8c1217ec098e68cb50c326dbc6002: {
    ...cvs2StageAttribBase,
    name: 'Kinderdijk, Netherlands',
    identifier: '0x03',
    filenamePattern: '^STG03(.mn)?POL.BIN$'
  },
  f9c9ff88bd9f32aae7fdf5230e8341c37769d531: {
    ...cvs2StageAttribBase,
    name: 'London, England',
    identifier: '0x04',
    filenamePattern: '^STG04(.mn)?POL.BIN$'
  },
  ccb15669b289798b6309bfb34987bead9419a2a4: {
    ...cvs2StageAttribBase,
    name: 'Barentsburg, Norway',
    identifier: '0x05',
    filenamePattern: '^STG05(.mn)?POL.BIN$'
  },
  '1997a444821098aa2e7d15b57697c91c89f9ca69': {
    ...cvs2StageAttribBase,
    name: 'Training Stage',
    identifier: '0x0A',
    filenamePattern: '^STG0A(.mn)?POL.BIN$'
  }
} as const;

export default cvs2StageAttribMappings;
