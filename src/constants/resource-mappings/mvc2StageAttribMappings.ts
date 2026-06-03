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

  'mvc2-stg-01': {
    ...mvc2StageAttribBase,
    name: 'Desert Stage (Orange Sky)',
    identifier: '0x01',
    filenamePattern: '^STG01(.mn)?POL.BIN$',
    modelHints: {
      0: {
        name: 'Desert floor and canyons',
        description:
          'The main stage area, featuring a desert landscape with large canyons and rock formations',
        keywords: ['desert', 'canyon', 'tipi', 'cactus', 'cactii', 'shrubs']
      },
      1: {
        name: 'Skybox (A)',
        description: 'Continuously scrolling orange sky with clouds',
        keywords: ['sky', 'clouds', 'orange']
      },
      2: {
        name: 'Skybox (B)',
        description: 'Continuously scrolling orange sky with clouds',
        keywords: ['sky', 'clouds', 'orange']
      },
      3: {
        name: 'Sombrero',
        description:
          "Sombrero that hangs on a cactus in the background. Maybe it belongs to a friend of Amingo's...",
        keywords: ['sombrero', 'hat', 'Mexican hat']
      },
      5: {
        name: 'Serape (A)',
        description: 'Serape drying on a clothesline in the background',
        keywords: ['serape', 'clothesline', 'background', 'Mexican towel']
      },
      6: {
        name: 'Serape (B)',
        description: 'Serape drying on a clothesline in the background',
        keywords: ['Mexican towel']
      },
      8: {
        name: 'Front of hanging-cloth (A)',
        description: 'Red cloth hanging on a clothesline in the background'
      },
      9: {
        name: 'Front of hanging-cloth (B)',
        description: 'Red cloth hanging on a clothesline in the background'
      },
      10: {
        name: 'Back of hanging-cloth',
        description: 'Red cloth hanging on a clothesline in the background'
      },
      12: {
        name: 'Rock (A)',
        keywords: ['stone']
      },
      13: {
        name: 'Rock (B)',
        keywords: ['stone']
      },
      14: {
        name: 'Flying turkey vulture (A)',
        description: flyingTurkeyDesc,
        keywords: ['buzzard', 'hawk', 'condor', 'eagle']
      },
      15: {
        name: 'Flying turkey vulture (B)',
        description: flyingTurkeyDesc,
        keywords: ['buzzard', 'hawk', 'condor', 'eagle']
      }
    },
    textureDefsHash: 'a3009e0b48cad0ccf66ef9ad9f1d77c0c377cc27'
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
    filenamePattern: '^STG05(.mn)?POL.BIN$'
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
    name: 'Ship Stage (Night)',
    identifier: '0x09',
    filenamePattern: '^STG09(.mn)?POL.BIN$'
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
    textureDefsHash: 'a3009e0b48cad0ccf66ef9ad9f1d77c0c377cc27'
  },
  de2532783f8b0f492199474eea4ef7c530dcc682: {
    ...mvc2StageAttribBase,
    name: 'Training Stage',
    identifier: '0x0B',
    filenamePattern: '^STG0B(.mn)?POL.BIN$'
  },
  'mvc2-stg-0C': {
    ...mvc2StageAttribBase,
    name: 'Carnival Stage (Night)',
    identifier: '0x0C',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c'
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
    filenamePattern: '^STG0E(.mn)?POL.BIN$'
  },
  '8a76bc28baa845b935c9d60d8024c03c00a5de7c': {
    ...mvc2StageAttribBase,
    name: 'Clocktower Stage (Snowy)',
    identifier: '0x0F',
    filenamePattern: '^STG0F(.mn)?POL.BIN$'
  }
} as const;

export default mvc2StageAttribMappings;
