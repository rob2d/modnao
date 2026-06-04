export const mvc2StageDesertOrangeSkyModelHints = {
  0: {
    name: 'Desert floor and canyons',
    description:
      'The main stage area, featuring a desert landscape with large canyons and rock formations',
    keywords: ['desert', 'canyon', 'tipi', 'cactus', 'cactii', 'shrubs', 'mesa']
  },
  1: {
    name: 'Skybox (A)',
    description: 'Continuously scrolling orange sky with clouds',
    keywords: ['clouds', 'orange']
  },
  2: {
    name: 'Skybox (B)',
    description: 'Continuously scrolling orange sky with clouds',
    keywords: ['clouds', 'orange']
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
    keywords: ['serape', 'clothesline', 'background', 'Mexican towel']
  },
  8: {
    name: 'Hanging cloth (Front A)',
    description: `Red cloth hanging on a clothesline in the background.
The front and back of the cloth are separate polygons,
so they can have different textures and lighting effects`,
    keywords: ['fabric', 'drapery']
  },
  9: {
    name: 'Hanging cloth (Front B)',
    description: `Red cloth hanging on a clothesline in the background.
The front and back of the cloth are separate polygons,
so they can have different textures and lighting effects`,
    keywords: ['fabric', 'drapery']
  },
  10: {
    name: 'Hanging cloth (Back A)',
    description: `Red cloth hanging on a clothesline in the background.
The front and back of the cloth are separate polygons,
so they can have different textures and lighting effects`,
    keywords: ['fabric', 'drapery']
  },
  11: {
    name: 'Hanging cloth (Back B)',
    description: `Red cloth hanging on a clothesline in the background.
The front and back of the cloth are separate polygons,
so they can have different textures and lighting effects`,
    keywords: ['fabric', 'drapery']
  },
  12: {
    name: 'Rock (A)',
    keywords: ['stone', 'boulder']
  },
  13: {
    name: 'Rock (B)',
    keywords: ['stone', 'boulder']
  },
  14: {
    name: 'Flying turkey vulture (A)',
    description: `
Natives to nearly all of the Americas, these large birds appear circling in the \
background. That circling is probably either a search pattern for prey or a signal\
 to other vultures that an epic battle is unfolding below.`,
    keywords: ['buzzard', 'hawk', 'condor', 'eagle']
  },
  15: {
    name: 'Flying turkey vulture (B)',
    description: `
Natives to nearly all of the Americas, these large birds appear circling in the \
background. That circling is probably either a search pattern for prey or a signal\
 to other vultures that an epic battle is unfolding below.`,
    keywords: ['buzzard', 'hawk', 'condor', 'eagle']
  }
} as const;

export const mvc2StageCaveWaterModelHints = {
  0: {
    name: 'Cave interior',
    description:
      'Interior of the cave with an Abyss statue, stalactites and floating rock shelves, and a grave floating in the center. Light of the water surface reflects around',
    keywords: ['gargoyle']
  },
  1: {
    name: 'Cave water surface',
    description: 'Surface of the water inside the cave'
  },
  9: {
    name: 'Reflection of refracting water surface on cave ceiling',
    keywords: ['stalactites']
  }
} as const;

export const mvc2StageDesertBlueSkyModelHints = {
  ...mvc2StageDesertOrangeSkyModelHints,
  1: {
    ...mvc2StageDesertOrangeSkyModelHints[1],
    description: mvc2StageDesertOrangeSkyModelHints[1].description.replace(
      'orange',
      'blue'
    ),
    keywords: mvc2StageDesertOrangeSkyModelHints[1].keywords.map((keyword) =>
      keyword === 'orange' ? 'blue' : keyword
    )
  },
  2: {
    ...mvc2StageDesertOrangeSkyModelHints[2],
    description: mvc2StageDesertOrangeSkyModelHints[2].description.replace(
      'orange',
      'blue'
    ),
    keywords: mvc2StageDesertOrangeSkyModelHints[2].keywords.map((keyword) =>
      keyword === 'orange' ? 'blue' : keyword
    )
  }
} as const;

export const mvc2EffectsModelHints = {
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
      "Arrow pointer that faces Player 1 when they've gone off-camera"
  },
  17: {
    name: 'P1-is-below indicator',
    description: 'Points up towards Player 1 when they are below the camera'
  },
  18: {
    name: 'P2 arrow',
    description:
      "Arrow pointer that faces Player 2 when they've gone off-camera"
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
} as const;
