import { ResourceAttribs } from '@/types/ResourceAttribs';

const resourceAttribMappings: Record<string, ResourceAttribs> = {
  b74ed77a9074a54512e46346c723e3be8cef07a0: {
    game: 'CVS2',
    name: 'Player & Ratio Select',
    identifier: '0x01',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DM01(.mn)?POL.BIN$',
    textureDefsHash: 'b74ed77a9074a54512e46346c723e3be8cef07a0',
    hasLzssTextureFile: true
  },
  f6267bcb211d053d6b21b2e224acafd150854f6c: {
    game: 'MVC2',
    name: 'Carnival (Night)',
    identifier: '0x0C',
    resourceType: 'mvc2-stage',
    textureDefsHash: 'f6267bcb211d053d6b21b2e224acafd150854f6c',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    hasLzssTextureFile: false
  }
} as const;

export default resourceAttribMappings;
