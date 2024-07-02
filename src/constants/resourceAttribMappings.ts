import { ResourceAttribs } from '@/types/ResourceAttribs';

const resourceAttribMappings: Record<string, ResourceAttribs> = {
  ['c0ab42c3d395afd396e74c5c1a224d171faa8785']: {
    game: 'CVS2',
    name: 'Player & Groove Select',
    identifier: '0x00',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM00(.mn)?POL.BIN$',
    textureDefsHash: 'c0ab42c3d395afd396e74c5c1a224d171faa8785',
    hasLzssTextureFile: true
  },
  ['b74ed77a9074a54512e46346c723e3be8cef07a0']: {
    game: 'CVS2',
    name: 'Player & Groove Select',
    identifier: '0x01',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM01(.mn)?POL.BIN$',
    textureDefsHash: 'b74ed77a9074a54512e46346c723e3be8cef07a0',
    hasLzssTextureFile: true
  },
  ['234a25a4fae5a53756fcfd180750b926c3d816ea']: {
    game: 'CVS2',
    name: 'Player & Ratio Select',
    identifier: '0x02',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM02(.mn)?POL.BIN$',
    textureDefsHash: '234a25a4fae5a53756fcfd180750b926c3d816ea',
    hasLzssTextureFile: true
  },
  ['e96373e252988b7b01dd1542f7aac5be14740e7c']: {
    game: 'CVS2',
    name: 'Stage & Player Order',
    identifier: '0x03',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM03(.mn)?POL.BIN$',
    textureDefsHash: 'e96373e252988b7b01dd1542f7aac5be14740e7c',
    hasLzssTextureFile: true
  },
  ['4073546357847642db623741429d0379e65b18db']: {
    game: 'CVS2',
    name: 'HUD & New Challenger',
    identifier: '0x04',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM04(.mn)?POL.BIN$',
    textureDefsHash: '4073546357847642db623741429d0379e65b18db',
    hasLzssTextureFile: true
  },
  ['cfa93b9d48d530fdd55b83aae884899682a469bb']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x05',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM05(.mn)?POL.BIN$',
    textureDefsHash: 'cfa93b9d48d530fdd55b83aae884899682a469bb',
    hasLzssTextureFile: true
  },
  ['cd8a97c922b4c3b70a2cdef77ac875308c2634c7']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x06',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM06(.mn)?POL.BIN$',
    textureDefsHash: 'cd8a97c922b4c3b70a2cdef77ac875308c2634c7',
    hasLzssTextureFile: true
  },
  ['f2ad774a770d9af0e2f12563ca32f2696e487e9d']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x07',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM07(.mn)?POL.BIN$',
    textureDefsHash: 'f2ad774a770d9af0e2f12563ca32f2696e487e9d',
    hasLzssTextureFile: false
  },
  ['5aa7a27512e74fda6bf3aed2e62df6d2ebdab363']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x08',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM08(.mn)?POL.BIN$',
    textureDefsHash: 'f2ad774a770d9af0e2f12563ca32f2696e487e9d',
    hasLzssTextureFile: true
  },
  ['b74caa7d3f89fcce022a3b500f7b9fe4d5fcdc70']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x09',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM09(.mn)?POL.BIN$',
    textureDefsHash: 'b74caa7d3f89fcce022a3b500f7b9fe4d5fcdc70',
    hasLzssTextureFile: true
  },
  ['06a61b584c40ef35e4b8812db09f370a280d17ec']: {
    game: 'CVS2',
    name: '???',
    identifier: '0x10',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM10(.mn)?POL.BIN$',
    textureDefsHash: '06a61b584c40ef35e4b8812db09f370a280d17ec',
    hasLzssTextureFile: true
  },
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
