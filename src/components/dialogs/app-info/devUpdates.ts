export interface XUpdate {
  parts: XUpdatePart[];
  publishedAt: string;
}

export interface XUpdatePart {
  hasImages?: boolean;
  hasVideo?: boolean;
  textLines: string[];
  url: string;
}

export const xUpdates: XUpdate[] = [
  {
    publishedAt: '2026-06-20',
    parts: [
      {
        hasVideo: true,
        textLines: [
          '- cam positions are now remembered per-model',
          '- model cam positions can be reset via a button'
        ],
        url: 'https://x.com/rob2d_u8/status/2068155419902542132?ref_src=twsrc%5Etfw'
      },
      {
        hasVideo: true,
        textLines: [
          '- panel styling has been tightened up a bit',
          '- a new resource annotation search from the welcome page'
        ],
        url: 'https://x.com/rob2d_u8/status/2068155421873860645'
      },
      {
        hasVideo: true,
        textLines: [
          '- a toggle to either hide or show alpha in the texture panel',
          '- fix live texture UV preview edge cases'
        ],
        url: 'https://x.com/rob2d_u8/status/2068155423744549270'
      },
      {
        hasVideo: true,
        textLines: [
          '- texture view button to see mapped models',
          '- hovering each item shows how each model maps to the texture',
          '- clicking items nav to that model'
        ],
        url: 'https://x.com/rob2d_u8/status/2068155425858494918'
      }
    ]
  },
  {
    publishedAt: '2026-06-12',
    parts: [
      {
        hasVideo: true,
        textLines: [
          "- camera auto-zooms to fit models in bounds, points to models while nav'ing",
          "- models indexed w/o model data get auto-skipped while nav'ing",
          '-can cycle models from first/last',
          '- new camera speed option/feels better',
          '- better use of space in scene options'
        ],
        url: 'https://x.com/rob2d_u8/status/2065597792953786845?ref_src=twsrc%5Etfw'
      },
      {
        hasVideo: true,
        textLines: ['- 8/16 MVC2 stages annotated'],
        url: 'https://x.com/rob2d_u8/status/2065618444138025134'
      }
    ]
  },
  {
    publishedAt: '2026-06-02',
    parts: [
      {
        hasImages: true,
        hasVideo: true,
        textLines: [
          '- initial support for supported resource search on the ModNao welcome page',
          '- MVC2/CVS2 stage resources all mapped and misc scenes/menus'
        ],
        url: 'https://x.com/rob2d_u8/status/2061972351156105478'
      }
    ]
  },
  {
    publishedAt: '2026-06-01',
    parts: [
      {
        hasImages: true,
        hasVideo: true,
        textLines: [
          '- new resource annotation system',
          '- MVC2 desert stages and partial special effects annotations'
        ],
        url: 'https://x.com/rob2d_u8/status/2061293489514574332'
      }
    ]
  },
  {
    publishedAt: '2026-05-29',
    parts: [
      {
        hasVideo: true,
        textLines: ['- better cam controls (freecam x orbital)'],
        url: 'https://x.com/rob2d_u8/status/2068155425858494918'
      }
    ]
  },
  {
    publishedAt: '2026-05-24',
    parts: [
      {
        hasImages: true,
        textLines: [
          '- render texture view as pixelated vs aliased when it makes most sense'
        ],
        url: 'https://x.com/rob2d_u8/status/2068155425858494918'
      }
    ]
  },
  {
    publishedAt: '2026-05-23',
    parts: [
      {
        hasVideo: true,
        textLines: ['- MVC2 special effects supported! (EFKYTEX.BIN)'],
        url: 'https://x.com/rob2d_u8/status/2058077260704325737'
      }
    ]
  }
];
