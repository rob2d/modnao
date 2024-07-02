import { ResourceAttribs } from '@/types/ResourceAttribs';

const cvs2MenuAssets = Object.fromEntries(
  [
    {
      identifier: '00',
      name: 'Player & Groove Select',
      textureDefsHash: 'c0ab42c3d395afd396e74c5c1a224d171faa8785',
      hasLzssTextureFile: true
    },
    {
      identifier: '01',
      name: 'Player & Groove Select',
      textureDefsHash: 'b74ed77a9074a54512e46346c723e3be8cef07a0',
      hasLzssTextureFile: true
    },
    {
      identifier: '02',
      name: 'Player & Ratio Select',
      textureDefsHash: '234a25a4fae5a53756fcfd180750b926c3d816ea',
      hasLzssTextureFile: true
    },
    {
      identifier: '03',
      name: 'Stage & Player Order',
      textureDefsHash: 'e96373e252988b7b01dd1542f7aac5be14740e7c',
      hasLzssTextureFile: true
    },
    {
      identifier: '04',
      name: 'HUD & New Challenger',
      textureDefsHash: '4073546357847642db623741429d0379e65b18db',
      hasLzssTextureFile: true
    },
    {
      identifier: '05',
      name: '???',
      filenamePattern: '^DM05(.mn)?POL.BIN$',
      textureDefsHash: 'cfa93b9d48d530fdd55b83aae884899682a469bb',
      hasLzssTextureFile: true
    },
    {
      identifier: '06',
      name: '???',
      filenamePattern: '^DM06(.mn)?POL.BIN$',
      textureDefsHash: 'cd8a97c922b4c3b70a2cdef77ac875308c2634c7',
      hasLzssTextureFile: true
    },
    {
      identifier: '07',
      name: '???',
      filenamePattern: '^DM07(.mn)?POL.BIN$',
      textureDefsHash: 'f2ad774a770d9af0e2f12563ca32f2696e487e9d',
      hasLzssTextureFile: false
    },
    {
      identifier: '08',
      name: '???',
      filenamePattern: '^DM08(.mn)?POL.BIN$',
      textureDefsHash: 'f2ad774a770d9af0e2f12563ca32f2696e487e9d',
      hasLzssTextureFile: true
    },
    {
      identifier: '09',
      name: '???',
      filenamePattern: '^DM09(.mn)?POL.BIN$',
      textureDefsHash: 'b74caa7d3f89fcce022a3b500f7b9fe4d5fcdc70',
      hasLzssTextureFile: true
    },
    {
      identifier: '10',
      name: '???',
      filenamePattern: '^DM10(.mn)?POL.BIN$',
      textureDefsHash: '06a61b584c40ef35e4b8812db09f370a280d17ec',
      hasLzssTextureFile: true
    },
    {
      name: '???',
      identifier: '11',
      filenamePattern: '^DM11(.mn)?POL.BIN$',
      textureDefsHash: '8abaeac1aa3cf80db93b9eebc46939693233a97f',
      hasLzssTextureFile: true
    },
    {
      name: '???',
      identifier: '0x12',
      filenamePattern: '^DM12(.mn)?POL.BIN$',
      textureDefsHash: '5d35f8ff19efd92bc84f626df0bac9d47f80cf33',
      hasLzssTextureFile: true
    }
  ].map((v) => [
    v.textureDefsHash,
    {
      ...v,
      game: 'CVS2',
      resourceType: 'cvs2-menu',
      filenamePattern: `^DM${v.identifier}(.mn)?POL.BIN$`,
      identifier: `0x${v.identifier}`
    }
  ])
);

const resourceAttribMappings: Record<string, ResourceAttribs> = {
  ...cvs2MenuAssets,
  ['f6267bcb211d053d6b21b2e224acafd150854f6c']: {
    game: 'MVC2',
    name: 'Carnival (Night)',
    identifier: '0x0C',
    resourceType: 'mvc2-stage',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c',
    hasLzssTextureFile: false
  }
} as const;

export default resourceAttribMappings;
