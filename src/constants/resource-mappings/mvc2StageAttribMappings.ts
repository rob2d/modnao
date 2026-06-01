const mvc2StageAttribBase = {
  game: 'MVC2',
  resourceType: 'mvc2-stage',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: false
} as const;

const flyingTurkeyDesc = `
Natives to nearly all of the Americas, these large birds appear circling in the \
background. That circling is probably either a search pattern for prey or a signal\
 to other vultures that an epic battle is unfolding below.`;

const mvc2StageAttribMappings = {
  '1a92b0e5df4882371bd58ff04b3a522341ee25b4': {
    ...mvc2StageAttribBase,
    name: 'Ship Stage (Day)',
    identifier: '0x00',
    filenamePattern: '^STG00(.mn)?POL.BIN$'
  },

  a3009e0b48cad0ccf66ef9ad9f1d77c0c377cc27: {
    ...mvc2StageAttribBase,
    name: 'Desert Stage',
    identifier: '0x01',
    filenamePattern: '^STG01(.mn)?POL.BIN$',
    modelHints: {
      14: {
        name: 'Flying turkey vulture (A)',
        description: flyingTurkeyDesc
      },
      15: {
        name: 'Flying turkey vulture (B)',
        description: flyingTurkeyDesc
      }
    }
  },

  a0a9cbad5ae72e2753f2e738359c2ed9274aca35: {
    ...mvc2StageAttribBase,
    name: 'Factory Stage',
    identifier: '0x02',
    filenamePattern: '^STG02(.mn)?POL.BIN$'
  },

  'mvc2-stg-03': {
    ...mvc2StageAttribBase,
    name: 'Carnival Stage (Day)',
    identifier: '0x03',
    filenamePattern: '^STG03(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c'
  },
  'mvc2-stg-0C': {
    ...mvc2StageAttribBase,
    name: 'Carnival Stage (Night)',
    identifier: '0x0C',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c'
  }
} as const;

export default mvc2StageAttribMappings;
