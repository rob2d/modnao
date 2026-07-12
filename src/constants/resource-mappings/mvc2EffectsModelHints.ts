const snapbackSparksEntry = {
  name: 'Snapback sparks',
  description: 'Sparks that float around before a player performs a snapback'
};

const lightNormalHitSparksEntry = {
  name: 'Hit sparks',
  description:
    'Hit sparks that appear when a player successfully lands a normal or various specials against an opponent'
};

const lightNormalHitSparkRanges = [
  { start: 88, end: 93, variant: 'A' },
  { start: 108, end: 113, variant: 'B' },
  { start: 114, end: 120, variant: 'C' }
] as const;

const mvc2EffectsModelHints = {
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
  },
  43: {
    name: 'Super start-up ring',
    description:
      'A ring overlay that slowly grows when a character begins a super'
  },
  83: {
    name: 'Hit collision',
    description:
      'One of the effects when normal and various hits land against an opponent'
  },
  69: {
    name: 'Super jump ground burst',
    description:
      'The burst effect that appears on the ground when performing a super jump'
  },
  67: {
    name: 'Super jump player burst',
    description:
      'The cylinder burst effect that appears on the player when performing a super jump'
  },
  ...Object.fromEntries(
    lightNormalHitSparkRanges.flatMap(({ start, end, variant }) =>
      [...Array(end - start + 1).keys()].map((i) => [
        start + i,
        {
          ...lightNormalHitSparksEntry,
          name: `${lightNormalHitSparksEntry.name} (${variant}) Fr${i + 1}`
        }
      ])
    )
  ),
  170: {
    name: 'Special ground burst ring',
    description:
      'When a character performs a special or a super, this ring of energy appears briefly under their feet.'
  },
  220: {
    name: 'Snapback gold sphere',
    description: 'Sphere that appears around a player performing a snapback'
  },
  221: {
    name: 'Snapback gold collapsed sphere',
    description:
      'Collapsed sphere that appears around a player performing a snapback'
  },
  ...Object.fromEntries(
    [...Array(15).keys()].map((i) => [
      i + 222,
      {
        ...snapbackSparksEntry,
        name: `${snapbackSparksEntry.name} Fr${i + 1}`
      }
    ])
  )
} as const;

export default mvc2EffectsModelHints;
