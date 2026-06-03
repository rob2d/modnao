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
      16: {
        name: 'P1 arrow',
        description:
          "Arrow pointer that faces Player 1 when they\'ve gone off-camera"
      },
      17: {
        name: 'P1-is-below indicator',
        description: 'Points up towards Player 1 when they are below the camera'
      },
      18: {
        name: 'P2 arrow',
        description:
          "Arrow pointer that faces Player 2 when they\'ve gone off-camera"
      },
      19: {
        name: 'P2-is-below-indicator indicator',
        description: 'Points up towards Player 2 when they are below the camera'
      },
      20: {
        name: 'P1-assist-indicator',
        description:
          "Identifies Player 1's assist character when they jump on-screen"
      },
      21: {
        name: 'P2-assist-indicator',
        description:
          "Identifies Player 2's assist character when they jump on-screen"
      }
    }
  }
} as const;

export default mvc2EffectsAttribMappings;
