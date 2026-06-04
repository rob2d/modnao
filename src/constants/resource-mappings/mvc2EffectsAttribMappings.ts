import { mvc2EffectsModelHints } from './mvc2StageModelHints';

const mvc2EffectsAttribMappings = {
  'mvc2-special-effects': {
    game: 'MVC2',
    name: 'Special Effects',
    identifier: 'EFKYTEX',
    resourceType: 'mvc2-menu',
    filenamePattern: '^EFKY(.mn)?TEX.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'mvc2-special-effects',
    hasLzssTextureFile: false
  },
  c8fd59b26aed2e4a87af2ed05c851d9b0510b219: {
    game: 'MVC2',
    name: 'Special Effects',
    identifier: 'EFKYPOL',
    resourceType: 'mvc2-menu',
    filenamePattern: '^EFKY(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'mvc2-special-effects',
    hasLzssTextureFile: false,
    modelHints: mvc2EffectsModelHints
  }
} as const;

export default mvc2EffectsAttribMappings;
