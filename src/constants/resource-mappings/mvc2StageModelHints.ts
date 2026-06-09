const desertSkyboxEntry = {
  name: 'Skybox',
  description: 'Continuously scrolling orange sky with clouds',
  keywords: ['clouds', 'orange']
};

const airshipBackgroundAirshipEntry = {
  name: 'Background airship',
  description:
    "An airship flying above the main ship's topside in the distance along the way"
};

const airshipCloudEntry = {
  name: 'Cloud passing through',
  description:
    'A cloud passing through from the camera foreground to behind the ship as it travels',
  keywords: ['cloud', 'fog']
};

const airshipPropellerEntry = {
  name: 'Spinning propeller',
  description:
    'A spinning propeller sitting on its shaft that sits topside on the ship',
  keywords: ['axle']
};

const backgroundAirshipPropellerEntry = {
  name: 'Background airship spinning propeller',
  description: "The background flying airship's back-spinning propeller"
};

const airshipThunderDescription =
  'Thunder flashes in the clouds behind the airship';

const airshipFlagEntry = {
  name: 'Skull and crossbones flag',
  description: 'Flag masted of a skull and crossbones on the main stage airship'
};

const shootingStarEntry = {
  name: 'Shooting Star',
  description: 'Shooting Stars that fall in the night sky',
  keywords: ['comet']
};

const nightWavesEntry = {
  name: 'Night waves',
  description: 'Surface of the ocean reflecting the night sky'
};

export const mvc2StageAirshipDayModelHints = {
  0: {
    name: 'Ship topside',
    description:
      'Ship deck surface, cannons, mast chains, and blue sky background',
    keywords: ['planks']
  },
  1: {
    ...airshipBackgroundAirshipEntry,
    name: `${airshipBackgroundAirshipEntry.name} (A)`
  },
  2: {
    ...airshipPropellerEntry,
    name: `${airshipPropellerEntry.name} (A)`
  },
  ...Object.fromEntries(
    [3, 4, 5, 6].map((i) => [
      i,
      {
        name: `Thunder Fr${i - 2}`,
        description: airshipThunderDescription
      }
    ])
  ),
  7: {
    ...backgroundAirshipPropellerEntry,
    name: `${backgroundAirshipPropellerEntry.name} (A)`
  },
  8: {
    ...backgroundAirshipPropellerEntry,
    name: `${backgroundAirshipPropellerEntry.name} (B)`
  },
  9: {
    ...airshipCloudEntry,
    name: `${airshipCloudEntry.name} (A)`
  },
  10: {
    ...airshipCloudEntry,
    name: `${airshipCloudEntry.name} (B)`
  },
  12: {
    ...airshipFlagEntry
  },
  13: {
    ...airshipPropellerEntry,
    name: `${airshipPropellerEntry.name} (B)`
  },
  14: {
    ...airshipBackgroundAirshipEntry,
    name: `${airshipBackgroundAirshipEntry.name} (B)`
  }
} as const;

export const mvc2StageAirshipNightModelHints = {
  0: {
    name: 'Ship topside',
    description:
      'Ship deck surface, cannons, mast chains, and night sky background',
    keywords: ['moon', 'stars', 'clouds']
  },
  2: {
    ...airshipPropellerEntry,
    name: `${airshipPropellerEntry.name} (A)`
  },
  12: {
    ...airshipFlagEntry
  },
  13: {
    ...airshipPropellerEntry,
    name: `${airshipPropellerEntry.name} (B)`
  },
  15: {
    ...shootingStarEntry
  },
  ...Object.fromEntries(
    [20, 21].map((i) => [
      i,
      {
        ...nightWavesEntry,
        name: `${nightWavesEntry.name} (${i === 20 ? 'A' : 'B'})`
      }
    ])
  )
} as const;

const desertSerapeEntry = {
  name: 'Serape',
  description: 'Serape drying on a clothesline in the background',
  keywords: ['serape', 'clothesline', 'background', 'Mexican towel']
};

const desertHangingClothEntry = {
  name: 'Hanging cloth',
  description: `Red cloth hanging on a clothesline in the background.`,
  keywords: ['fabric', 'drapery']
};

const desertRockEntry = {
  name: 'Rock',
  keywords: ['stone', 'boulder']
};

const desertVultureEntry = {
  name: 'Flying turkey vulture',
  description: `
Natives to nearly all of the Americas, these large birds appear circling in the \
background. That circling is probably either a search pattern for prey or a signal\
 to other vultures that an epic battle is unfolding below.`,
  keywords: ['buzzard', 'hawk', 'condor', 'eagle']
};

export const mvc2StageDesertOrangeSkyModelHints = {
  0: {
    name: 'Desert floor and canyons',
    description:
      'The main stage area, featuring a desert landscape with large canyons and rock formations',
    keywords: ['desert', 'canyon', 'tipi', 'cactus', 'cactii', 'shrubs', 'mesa']
  },
  1: {
    ...desertSkyboxEntry,
    name: `${desertSkyboxEntry.name} (A)`
  },
  2: {
    ...desertSkyboxEntry,
    name: `${desertSkyboxEntry.name} (B)`
  },
  3: {
    name: 'Sombrero',
    description:
      "Sombrero that hangs on a cactus in the background. Maybe it belongs to a friend of Amingo's...",
    keywords: ['sombrero', 'hat', 'Mexican hat']
  },
  5: {
    ...desertSerapeEntry,
    name: `${desertSerapeEntry.name} (A)`
  },
  6: {
    ...desertSerapeEntry,
    name: `${desertSerapeEntry.name} (B)`
  },
  8: {
    ...desertHangingClothEntry,
    name: `${desertHangingClothEntry.name} (Front A)`
  },
  9: {
    ...desertHangingClothEntry,
    name: `${desertHangingClothEntry.name} (Front B)`
  },
  10: {
    ...desertHangingClothEntry,
    name: `${desertHangingClothEntry.name} (Back A)`
  },
  11: {
    ...desertHangingClothEntry,
    name: `${desertHangingClothEntry.name} (Back B)`
  },
  12: {
    ...desertRockEntry,
    name: `${desertRockEntry.name} (A)`
  },
  13: {
    ...desertRockEntry,
    name: `${desertRockEntry.name} (B)`
  },
  14: {
    ...desertVultureEntry,
    name: `${desertVultureEntry.name} (A)`
  },
  15: {
    ...desertVultureEntry,
    name: `${desertVultureEntry.name} (B)`
  }
} as const;

const caveWaterEntry = {
  name: 'Cave water surface',
  description: 'Surface of the water inside the cave'
};

const caveLavaEntry = {
  name: 'Cave lava',
  description: 'Lava spanning the surface of the background of the cave'
};

const caveCeilingWaterDescription =
  'Reflection of refracting water surface on a cave ceiling spike';

const ceilingSpikeReflectionEntry = {
  name: 'Cave ceiling spike',
  description: caveCeilingWaterDescription,
  keywords: ['stalactites']
};

const flyingBatEntry = {
  name: 'Flying bat',
  description: 'Bat flying in the background of the cave stage',
  keywords: ['guano']
};

const waterSplashEntry = {
  name: 'Water splash',
  description: 'Droplet splash'
};

const lavaSplatterEntry = {
  name: 'Lava splatter',
  description: "splatterning of lava on it's surface",
  keywords: ['magma bubble']
};

const flyingBatEntries = Object.fromEntries(
  [18, 19, 20].map((i) => [
    i,
    {
      ...flyingBatEntry,
      name: `${flyingBatEntry.name} Fr${i - 17}`
    }
  ])
);

const abyssEyesEntry = {
  name: "Abyss statue's glowing eyes",
  description: 'Glowing eyes of the Abyss statue in the center of the cave',
  keywords: ['red']
};

export const mvc2StageCaveWaterModelHints = {
  0: {
    name: 'Cave interior',
    description:
      'Interior of the cave with an Abyss statue, stalactites and floating rock shelves, and a grave floating in the center. Light of the water surface reflects around',
    keywords: ['gargoyle', 'pond', 'shrine', 'tombstone', 'crypt']
  },
  1: {
    ...caveWaterEntry,
    name: `${caveWaterEntry.name} (A)`
  },
  2: {
    ...caveWaterEntry,
    name: `${caveWaterEntry.name} (B)`
  },
  3: {
    name: 'Cave water droplet forming',
    description: 'Droplet of water forming on the ceiling of the cave'
  },
  4: {
    name: 'Cave water droplet falling',
    description: 'Droplet of water falling from the ceiling of the cave'
  },
  5: {
    name: 'Circular water ripple',
    description: 'Circular ripple effect on the water surface'
  },
  ...Object.fromEntries(
    [9, 10, 11, 12, 13, 14, 15, 16].map((i) => {
      const spikeNumber = Math.floor((i - 9) / 2) + 1;
      const side = i % 2 === 1 ? 'A' : 'B';

      return [
        i,
        {
          ...ceilingSpikeReflectionEntry,
          name: `${ceilingSpikeReflectionEntry.name} ${spikeNumber} (${side})`
        }
      ];
    })
  ),
  17: abyssEyesEntry,
  ...flyingBatEntries,
  ...Object.fromEntries(
    [21, 22, 23, 24].map((i) => [
      i,
      {
        ...waterSplashEntry,
        name: `${waterSplashEntry.name} Fr${i - 20}`
      }
    ])
  )
} as const;

export const mvc2StageCaveLavaModelHints = {
  0: {
    name: 'Cave interior (Lava version)',
    description:
      'Interior of the cave with an Abyss statue, stalactites and floating rock shelves, and a grave floating in the center. Light from the lava illuminates the center',
    keywords: [
      'gargoyle',
      'pond',
      'shrine',
      'tombstone',
      'crypt',
      'volcano',
      'magma'
    ]
  },
  1: {
    ...caveLavaEntry,
    name: `${caveLavaEntry.name} (A)`
  },
  2: {
    ...caveLavaEntry,
    name: `${caveLavaEntry.name} (B)`
  },
  5: {
    name: 'Circular acid ripple',
    description:
      'Circular ripple effect from acid splattering on the lava surface'
  },
  ...Object.fromEntries(
    [9, 10, 11, 12, 13, 14, 15, 16].map((i) => {
      const spikeNumber = Math.floor((i - 9) / 2) + 1;
      const side = i % 2 === 1 ? 'A' : 'B';

      return [
        i,
        {
          ...ceilingSpikeReflectionEntry,
          name: `${ceilingSpikeReflectionEntry.name} ${spikeNumber} (${side})`,
          description: caveCeilingWaterDescription.replace('water', 'lava')
        }
      ];
    })
  ),
  ...flyingBatEntries,
  17: abyssEyesEntry,
  ...Object.fromEntries(
    [21, 22, 23, 24].map((i) => [
      i,
      {
        ...lavaSplatterEntry,
        name: `${lavaSplatterEntry.name} Fr${i - 20}`
      }
    ])
  )
};

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
