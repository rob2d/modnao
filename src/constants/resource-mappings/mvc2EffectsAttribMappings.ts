const mvc2EffectsAttribMappings = {
  'mvc2-special-effects': {
    game: 'MVC2',
    name: 'Special Effects',
    identifier: 'EFKY',
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
    identifier: 'EFKY',
    resourceType: 'mvc2-menu',
    filenamePattern: '^EFKY(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'mvc2-special-effects',
    hasLzssTextureFile: false,
    modelHints: {
      12: {
        name: 'Push Block #1 /Small dome',
        description: 'Small circular push block frame'
      },
      13: {
        name: 'Push Block #2 /Circle blowback',
        description: 'Larger circular push block frame'
      },
      14: {
        name: 'Push Block #3 /Spark flares start',
        description: 'Shield sparks that begin to fly on push block'
      },
      15: {
        name: 'Push Block #4 /Spark flares end',
        description: 'Shield sparks that end on push block'
      },
      17: {
        name: 'P1 arrow',
        description:
          "Arrow pointer that faces Player 1 when they\'ve gone off-camera"
      },
      18: {
        name: 'P2 arrow',
        description:
          "Arrow pointer that faces Player 2 when they\'ve gone off-camera"
      }
    }
  }
} as const;

export default mvc2EffectsAttribMappings;
