import {
  mvc2StageAirshipDayModelHints,
  mvc2StageAirshipNightModelHints,
  mvc2StageCarnivalModelHints,
  mvc2StageCaveLavaModelHints,
  mvc2StageCaveWaterModelHints,
  mvc2StageDesertBlueSkyModelHints,
  mvc2StageDesertOrangeSkyModelHints,
  mvc2StageFactoryModelHints
} from './mvc2StageModelHints';

const mvc2StageAttribBase = {
  game: 'MVC2',
  resourceType: 'mvc2-stage',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: false
} as const;

const mvc2StageAttribMappings = {
  '1a92b0e5df4882371bd58ff04b3a522341ee25b4': {
    ...mvc2StageAttribBase,
    name: 'Airship Stage (Day, Flying)',
    identifier: '0x00',
    filenamePattern: '^STG00(.mn)?POL.BIN$',
    modelHints: mvc2StageAirshipDayModelHints
  },

  'mvc2-stg-01': {
    ...mvc2StageAttribBase,
    name: 'Desert Stage (Orange Sky)',
    identifier: '0x01',
    filenamePattern: '^STG01(.mn)?POL.BIN$',
    modelHints: mvc2StageDesertOrangeSkyModelHints,
    textureDefsHash: 'a3009e0b48cad0ccf66ef9ad9f1d77c0c377cc27'
  },

  a0a9cbad5ae72e2753f2e738359c2ed9274aca35: {
    ...mvc2StageAttribBase,
    name: 'Factory Stage',
    identifier: '0x02',
    filenamePattern: '^STG02(.mn)?POL.BIN$',
    modelHints: mvc2StageFactoryModelHints
  },

  'mvc2-stg-03': {
    ...mvc2StageAttribBase,
    name: 'Carnival Stage (Summer/Spring)',
    identifier: '0x03',
    filenamePattern: '^STG03(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c',
    modelHints: mvc2StageCarnivalModelHints
  },

  ec7b71c7ebb3f5d94d9151e8eea39c9b9c71c8ea: {
    ...mvc2StageAttribBase,
    name: 'Swamp Stage',
    identifier: '0x04',
    filenamePattern: '^STG04(.mn)?POL.BIN$'
  },

  '57f55a1f8861c1d295159392837ce3b31af4e197': {
    ...mvc2StageAttribBase,
    name: 'Cave Stage (Water)',
    identifier: '0x05',
    filenamePattern: '^STG05(.mn)?POL.BIN$',
    modelHints: mvc2StageCaveWaterModelHints
  },
  '3eedbba7abec03cfe5955f713ec7f955d61b0470': {
    ...mvc2StageAttribBase,
    name: 'Clocktower Stage (Clear Sky)',
    identifier: '0x06',
    filenamePattern: '^STG06(.mn)?POL.BIN$'
  },
  '1d2668694458ae6900a59bd75b607fa51828803e': {
    ...mvc2StageAttribBase,
    name: 'River on Ice Stage',
    identifier: '0x07',
    filenamePattern: '^STG07(.mn)?POL.BIN$'
  },
  e4603d7ca5cf6738a6a743473caf781d869e71f9: {
    ...mvc2StageAttribBase,
    name: 'Abyss Stage',
    identifier: '0x08',
    filenamePattern: '^STG08(.mn)?POL.BIN$'
  },
  f36b6c7f9564dc02bc0c12e7766fa5425104f850: {
    ...mvc2StageAttribBase,
    name: 'Airship Stage (Night, Floating)',
    identifier: '0x09',
    filenamePattern: '^STG09(.mn)?POL.BIN$',
    modelHints: mvc2StageAirshipNightModelHints
  },
  '688be4ab25143b136e01ef602877151110657b07': {
    ...mvc2StageAttribBase,
    name: 'River on Raft Stage',
    identifier: '0x10',
    filenamePattern: '^STG10(.mn)?POL.BIN$'
  },
  'mvc2-stg-0a': {
    ...mvc2StageAttribBase,
    name: 'Desert Stage (Blue Sky)',
    identifier: '0x0A',
    filenamePattern: '^STG0A(.mn)?POL.BIN$',
    textureDefsHash: 'a3009e0b48cad0ccf66ef9ad9f1d77c0c377cc27',
    modelHints: mvc2StageDesertBlueSkyModelHints
  },
  de2532783f8b0f492199474eea4ef7c530dcc682: {
    ...mvc2StageAttribBase,
    name: 'Training Stage',
    identifier: '0x0B',
    filenamePattern: '^STG0B(.mn)?POL.BIN$'
  },
  'mvc2-stg-0c': {
    ...mvc2StageAttribBase,
    name: 'Carnival Stage (Winter/Fall)',
    identifier: '0x0C',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c',
    modelHints: mvc2StageCarnivalModelHints
  },
  f9e79fc060b662ac3c68697d289c4fd6871019c8: {
    ...mvc2StageAttribBase,
    name: 'Swamp (Asian)',
    identifier: '0x0D',
    filenamePattern: '^STG0D(.mn)?POL.BIN$'
  },
  '88da58474ef7803f63600b99e69aa9df928c8724': {
    ...mvc2StageAttribBase,
    name: 'Cave Stage (Lava)',
    identifier: '0x0E',
    filenamePattern: '^STG0E(.mn)?POL.BIN$',
    modelHints: mvc2StageCaveLavaModelHints
  },
  '8a76bc28baa845b935c9d60d8024c03c00a5de7c': {
    ...mvc2StageAttribBase,
    name: 'Clocktower Stage (Snowy)',
    identifier: '0x0F',
    filenamePattern: '^STG0F(.mn)?POL.BIN$'
  }
} as const;

export default mvc2StageAttribMappings;
