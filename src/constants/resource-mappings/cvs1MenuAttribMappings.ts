import type { ResourceAttribs } from '@/types';

const cvs1DemoResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Demo Model File (unspecified)',
  resourceType: 'cvs1-demo',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const cvs1DreamcastResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Dreamcast Menu File (unspecified)',
  resourceType: 'cvs1-menu',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const cvs1MenuSources = [
  {
    textureDefsHash: '37d9fb1acd9cac80d6f786850fa6c3b4c4ca044e',
    name: 'Demo Model 00',
    identifier: 'DM00',
    filenamePattern: '^DM00(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'e26c44c2c1d64b50f82f26a318bb9ff11be15a3f',
    name: 'Demo Model 01',
    identifier: 'DM01',
    filenamePattern: '^DM01(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'b8af7110a4b3f52895dc0c9828431d77d0cffb93',
    name: 'Demo Model 02',
    identifier: 'DM02',
    filenamePattern: '^DM02(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '2ee10db010879f59ca5aa3455e95fc889d3706a4',
    name: 'Demo Model 03',
    identifier: 'DM03',
    filenamePattern: '^DM03(.mn)?POL.BIN$',
    hasLzssTextureFile: false
  },
  {
    textureDefsHash: 'cfa1ad9b7a049d658c09fc747af6830c36b476e3',
    name: 'Demo Model 04',
    identifier: 'DM04',
    filenamePattern: '^DM04(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'aab4fad2fbf430fb3fd5509cbb7bf066381a01e7',
    name: 'Demo Model 05',
    identifier: 'DM05',
    filenamePattern: '^DM05(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '332b71c86b1e016b67276968c4191eaadebadcd2',
    name: 'Demo Model 06',
    identifier: 'DM06',
    filenamePattern: '^DM06(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'a9733269f854135cb450acefcaa67670a4601226',
    name: 'Demo Model 07',
    identifier: 'DM07',
    filenamePattern: '^DM07(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '5327708e5ecb2c549a8d1675e58d1576a3aea919',
    name: 'Demo Model 08',
    identifier: 'DM08',
    filenamePattern: '^DM08(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '12e8feca65c8089018ea0a4949e331278eeb7690',
    name: 'Demo Model 09',
    identifier: 'DM09',
    filenamePattern: '^DM09(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '3c66669c57920d07032420b6e11ed26511357756',
    name: 'Demo Models 10-75/88-91',
    identifier: 'DM10-DM75/DM88-DM91',
    filenamePattern:
      '^DM(1[0-9]|2[1235-9]|[3-6][0-9]|7[0-5]|8[89]|9[01])(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '2e57122211578849a0e64f316fdc82a222085469',
    name: 'Demo Models 20/24/92',
    identifier: 'DM20/DM24/DM92',
    filenamePattern: '^DM(20|24|92)(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'fa1610afca1439745d929b128065ce0b55f2714f',
    name: 'Demo Model 76',
    identifier: 'DM76',
    filenamePattern: '^DM76(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'bbdab340fbb21d360ef80a620eacd7c55e6810bc',
    name: 'Demo Model 77',
    identifier: 'DM77',
    filenamePattern: '^DM77(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '8a2eebe2404e73936fea34587acdbeadbaa498c6',
    name: 'Demo Model 78',
    identifier: 'DM78',
    filenamePattern: '^DM78(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'dda53329c0def9a81de4df2cb2decbcd22e3859f',
    name: 'Demo Model 79',
    identifier: 'DM79',
    filenamePattern: '^DM79(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '4922ab47fc64eef5ee2a30621733e3e6cfae4308',
    name: 'Demo Model 80',
    identifier: 'DM80',
    filenamePattern: '^DM80(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'd8fe02eae09901a05cd38c659748b17aa3f8477c',
    name: 'Demo Models 81-86',
    identifier: 'DM81-DM86',
    filenamePattern: '^DM8[1-6](.mn)?POL.BIN$'
  }
] as const;

const cvs1DreamcastSources = [
  {
    textureDefsHash: '452ad62f6b1a681bf1e2821047e0ec4bcd208359',
    name: 'Dreamcast Menu 00',
    identifier: 'DC00',
    filenamePattern: '^DC00(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '09dd5e9a38f66f8e17d24d89536f7a08dec96a5d',
    name: 'Dreamcast Menu 01',
    identifier: 'DC01',
    filenamePattern: '^DC01(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '3828c1c9cbbc4ecf57b2d47375ac44f485489bc7',
    name: 'Dreamcast Menus 02/13/14',
    identifier: 'DC02/DC13/DC14',
    filenamePattern: '^DC(02|13|14)(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '46ab3b79a7722f5410e9ae3927fee6f7466e36c5',
    name: 'Dreamcast Menu 03',
    identifier: 'DC03',
    filenamePattern: '^DC03(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'b47bc2e14375874994dc56ddb1738a2fd86bdd77',
    name: 'Dreamcast Menu 04',
    identifier: 'DC04',
    filenamePattern: '^DC04(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '59beec84ef82b9ef729d03491eaf1d4b692e011c',
    name: 'Dreamcast Menu 05',
    identifier: 'DC05',
    filenamePattern: '^DC05(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '0f9160c70236e47fe029e67b6c320eae0a8bb0a1',
    name: 'Dreamcast Menu 06',
    identifier: 'DC06',
    filenamePattern: '^DC06(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '25f845c1132b6c64e9ef9b408264d5ff8e1a971f',
    name: 'Dreamcast Menu 07',
    identifier: 'DC07',
    filenamePattern: '^DC07(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '15703dcb1c83f25ac4df17f6bb2ffba0ba02817e',
    name: 'Dreamcast Menu 08',
    identifier: 'DC08',
    filenamePattern: '^DC08(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '8479cf7fa14b4151fb3d90081185d35f0142e8fb',
    name: 'Dreamcast Menu 09',
    identifier: 'DC09',
    filenamePattern: '^DC09(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'b8839467c810e3f271a1190d661749fcb0994f74',
    name: 'Dreamcast Menu 10',
    identifier: 'DC10',
    filenamePattern: '^DC10(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '9d50e34716b43b9554c1f39745fc9f4f7526fa5a',
    name: 'Dreamcast Menu 11',
    identifier: 'DC11',
    filenamePattern: '^DC11(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '46d0f1bda75d7aac95546edd12623e8a09032487',
    name: 'Dreamcast Menu 12',
    identifier: 'DC12',
    filenamePattern: '^DC12(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: '54f188c3bbdc3e6508a797edfeec5712fa240da7',
    name: 'Dreamcast Menu 19',
    identifier: 'DC19',
    filenamePattern: '^DC19(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'c4249fbf6af80566dc66084f49d7d8eb1d585c5c',
    name: 'Dreamcast Menu 20',
    identifier: 'DC20',
    filenamePattern: '^DC20(.mn)?POL.BIN$',
    hasLzssTextureFile: false
  },
  {
    textureDefsHash: '8ba015405ad5df60e8cc21eed342aeaf0babb2fe',
    name: 'Dreamcast Menu 21',
    identifier: 'DC21',
    filenamePattern: '^DC21(.mn)?POL.BIN$'
  },
  {
    textureDefsHash: 'c48c61109144051f9686d7f2231bb12a0f2c4504',
    name: 'Dreamcast Menu 22',
    identifier: 'DC22',
    filenamePattern: '^DC22(.mn)?POL.BIN$',
    hasLzssTextureFile: false
  },
  {
    textureDefsHash: '3f4d6f623d3a137ad0f5af8a0a5ded7d6a63618a',
    name: 'Dreamcast Menu 23',
    identifier: 'DC23',
    filenamePattern: '^DC23(.mn)?POL.BIN$'
  }
] as const;

const cvs1ResourceSources = [
  ...cvs1MenuSources.map((source) => ({
    ...cvs1DemoResourceAttribs,
    ...source
  })),
  ...cvs1DreamcastSources.map((source) => ({
    ...cvs1DreamcastResourceAttribs,
    ...source
  }))
];

const cvs1MenuAttribMappings = Object.fromEntries(
  cvs1ResourceSources.map(
    ({ textureDefsHash, ...fields }) => [textureDefsHash, fields] as const
  )
) satisfies Record<string, ResourceAttribs>;

export default cvs1MenuAttribMappings;
