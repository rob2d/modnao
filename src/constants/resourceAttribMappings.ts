import { ResourceAttribs } from '@/types/ResourceAttribs';

const resourceAttribMappings: Record<string, ResourceAttribs> = {
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
