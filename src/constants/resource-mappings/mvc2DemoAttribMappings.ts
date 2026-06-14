import type { ResourceAttribs } from '@/types';
import createTextureDef from '@/utils/textures/createTextureDef';

const mvc2DemoAttribBase = {
  game: 'MVC2',
  resourceType: 'mvc2-menu',
  polygonMapped: true,
  oobReferencable: true,
  hasLzssTextureFile: false
} as const;

const titleWaterTextureBackgroundEntry = {
  name: 'Water texture background',
  description:
    'Checkered water texture behind the refracted waves on the demo title'
};

const titleStaticBlueWaterBackgroundEntry = {
  name: 'Static blue water background',
  description:
    'Static blue water texture behind the refracted waves on the demo title'
};

const titleWaterGodRaysEntry = {
  name: 'Title water god-rays',
  description:
    'Volumetric light that appears on the ocean backdrop behind the title screen'
};

const highScoreBgTubeEntry = {
  name: 'High score background tube',
  keywords: ['hiscore']
};

const highScoreScoreBoxSubtitleEntry = {
  name: 'High score "SCORE" box subtitle text',
  description:
    '"Score" text in the box along with the high score or the player\'s score, along with score background'
};

const highScoreScoreTitleEntry = {
  name: 'High score "SCORE RANKING" SCORE title text',
  keywords: ['hiscore', 'score text']
};

const highScoreRankingTitleEntry = {
  name: 'High score "SCORE RANKING" RANKING title text',
  keywords: ['hiscore', 'ranking text']
};

const mvc2DemoAttribMappings: Record<string, ResourceAttribs> = {
  '18251df14af4d9ad18ef4a071c880efd722c2d91': {
    ...mvc2DemoAttribBase,
    name: 'Game GUI, score and timer fonts',
    identifier: '0x00',
    filenamePattern: '^DM00(.mn)?POL.BIN$'
  },
  '55b5ad26b62e3f70e8ba2b0d83fe3a7c8b74bf94': {
    ...mvc2DemoAttribBase,
    name: 'Character select screen',
    identifier: '0x01',
    filenamePattern: '^DM01(.mn)?POL.BIN$'
  },
  ebac8fe14676aec7cd59a8078fb8f071c8c2e312: {
    ...mvc2DemoAttribBase,
    name: 'VS Tunnel screen',
    identifier: '0x02',
    filenamePattern: '^DM02(.mn)?POL.BIN$'
  },
  'mvc2-demo-dm03': {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 03',
    identifier: '0x03',
    filenamePattern: '^DM03(.mn)?POL.BIN$',
    textureDefsHash: '2282a008873bac696ec10a59b3e58b8c1a2a5e90'
  },
  '8ace738f7e62c8b71ef4766826a0e593dad16c0e': {
    ...mvc2DemoAttribBase,
    name: 'Here comes a new challenger screen',
    identifier: '0x04',
    filenamePattern: '^DM04(.mn)?POL.BIN$'
  },
  '9eb8a91ce83709d1db2a2f86eb14ab388ab75834': {
    ...mvc2DemoAttribBase,
    name: 'Pre-title screen water and ADX logo',
    identifier: '0x05',
    filenamePattern: '^DM05(.mn)?POL.BIN$',
    modelHints: {
      5: {
        ...titleWaterTextureBackgroundEntry,
        name: `${titleWaterTextureBackgroundEntry.name} (A)`
      },
      6: {
        ...titleWaterTextureBackgroundEntry,
        name: `${titleWaterTextureBackgroundEntry.name} (B)`
      },
      7: {
        ...titleStaticBlueWaterBackgroundEntry,
        name: `${titleStaticBlueWaterBackgroundEntry.name} (A)`
      },
      8: {
        ...titleStaticBlueWaterBackgroundEntry,
        name: `${titleStaticBlueWaterBackgroundEntry.name} (B)`
      },
      9: {
        ...titleWaterGodRaysEntry
      },
      23: {
        name: 'CAPCOM logo (white)',
        description:
          'Capcom logo faded to white on the initial demo title screen'
      },
      24: {
        name: 'ADX Logo'
      }
    }
  },
  '42d8b0fb000700a44741b7c24aceef71ef549e54': {
    ...mvc2DemoAttribBase,
    name: 'Arcade High score screen',
    identifier: '0x06',
    filenamePattern: '^DM06(.mn)?POL.BIN$',
    modelHints: {
      ...Object.fromEntries(
        [0, 1].map((i) => [
          i,
          {
            ...highScoreBgTubeEntry,
            name: `${highScoreBgTubeEntry.name} (${i === 0 ? 'A' : 'B'})`
          }
        ])
      ),
      7: {
        name: 'High score background tube speed streaks',
        keywords: ['hiscore', 'pink streaks']
      },
      ...Object.fromEntries(
        [8, 9].map((i) => [
          i,
          {
            ...highScoreScoreTitleEntry,
            name: `${highScoreScoreTitleEntry.name} (${i === 8 ? 'A' : 'B'})`
          }
        ])
      ),
      ...Object.fromEntries(
        [10, 11].map((i) => [
          i,
          {
            ...highScoreRankingTitleEntry,
            name: `${highScoreRankingTitleEntry.name} (${i === 10 ? 'A' : 'B'})`
          }
        ])
      ),
      ...Object.fromEntries(
        [14, 15].map((i) => [
          i,
          {
            ...highScoreScoreBoxSubtitleEntry,
            name: `${highScoreScoreBoxSubtitleEntry.name} (${i === 14 ? 'A' : 'B'})`
          }
        ])
      ),
      17: {
        name: '"YOU" score entry marker',
        description:
          "Marker that appears next to the player's score entry on the high score screen with a right-carat pointing to the score"
      },
      20: {
        name: '"OUT OF RANKING" marker',
        description:
          'Displays "OUT OF RANKING" on the high score screen when the player fails to get a high score'
      },
      28: {
        name: '"1st" score entry marker',
        description:
          'Marker that appears next to the top score entry on the high score demo screen with a right-carat pointing to the score',
        keywords: ['hiscore', 'crown', '1st place']
      }
    }
  },
  a331a8cdb99faab1b664fc4db98738808f8a5f59: {
    ...mvc2DemoAttribBase,
    name: 'MVC2 Title logo fade in',
    identifier: '0x07',
    filenamePattern: '^DM07(.mn)?POL.BIN$'
  },
  '7300aa4fe20ecbaf0323908c6785e259bf5a3d51': {
    ...mvc2DemoAttribBase,
    name: 'Intro reel vs games and features text',
    identifier: '0x08',
    filenamePattern: '^DM08(.mn)?POL.BIN$'
  },
  '8043343c5330e1d74e816ea55182dd962b9f01e6': {
    ...mvc2DemoAttribBase,
    name: 'Intro sky and CAPCOM logo',
    identifier: '0x09',
    filenamePattern: '^DM09(.mn)?POL.BIN$'
  },
  'mvc2-demo-dm0a': {
    ...mvc2DemoAttribBase,
    name: 'Japanese VMU message screen',
    identifier: '0x0A',
    filenamePattern: '^DM0A(.mn)?POL.BIN$',
    textureDefsHash: '36f24126412f66e736346801634d4ba97313bea3',
    hasLzssTextureFile: true
  },
  '5cd0462ccd859814391b2dce2e6794ef9f6f4fec': {
    ...mvc2DemoAttribBase,
    name: 'Game over screen',
    identifier: '0x0B',
    filenamePattern: '^DM0B(.mn)?POL.BIN$'
  },
  db7aca362e0da437d828b2b1f095b38a67b36f27: {
    ...mvc2DemoAttribBase,
    name: 'Game mode select menu',
    identifier: '0x0C',
    filenamePattern: '^DM0C(.mn)?POL.BIN$'
  },
  f43a94637c424d4225d199ea5385bb88bcfde07a: {
    ...mvc2DemoAttribBase,
    name: 'Network mode menu',
    identifier: '0x0D',
    filenamePattern: '^DM0D(.mn)?POL.BIN$'
  },
  'mvc2-demo-dm0e': {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 0E',
    identifier: '0x0E',
    filenamePattern: '^DM0E(.mn)?POL.BIN$',
    textureDefsHash: '36f24126412f66e736346801634d4ba97313bea3',
    hasLzssTextureFile: true,
    textureShapesMap: [
      createTextureDef({
        width: 128,
        height: 128,
        colorFormat: 'ARGB4444',
        colorFormatValue: 2,
        baseLocation: 0
      })
    ]
  },
  e7df78a4a6e235c13fec365f0c9ed26202736055: {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 0F',
    identifier: '0x0F',
    filenamePattern: '^DM0F(.mn)?POL.BIN$'
  },
  '2403a6adcf9b4f6bfe78b46d7d96accc7ff77736': {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 10',
    identifier: '0x10',
    filenamePattern: '^DM10(.mn)?POL.BIN$'
  },
  '66c93701985772d1b7f98866a73a9dd1e6af53b4': {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 11',
    identifier: '0x11',
    filenamePattern: '^DM11(.mn)?POL.BIN$'
  },
  'mvc2-demo-dm12': {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 12',
    identifier: '0x12',
    filenamePattern: '^DM12(.mn)?POL.BIN$',
    textureDefsHash: '2282a008873bac696ec10a59b3e58b8c1a2a5e90'
  },
  b3a5fcbe70f169b4b69a16b35e6a656de5ee21a0: {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 13',
    identifier: '0x13',
    filenamePattern: '^DM13(.mn)?POL.BIN$'
  },
  f886aaa8a434b54719647667b477956e346a8aa8: {
    ...mvc2DemoAttribBase,
    name: 'Demo Model 14',
    identifier: '0x14',
    filenamePattern: '^DM14(.mn)?POL.BIN$'
  }
};

export default mvc2DemoAttribMappings;
