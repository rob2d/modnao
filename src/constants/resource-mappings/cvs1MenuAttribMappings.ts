import type { ResourceAttribs } from '@/types';

const cvs1DemoResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Demo Model File (unspecified)',
  resourceType: 'cvs1-demo',
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

const cvs1MenuAttribMappings = Object.fromEntries(
  cvs1MenuSources.map(
    ({ textureDefsHash, ...fields }) =>
      [
        textureDefsHash,
        {
          ...cvs1DemoResourceAttribs,
          ...fields
        }
      ] as const
  )
) satisfies Record<string, ResourceAttribs>;

export default cvs1MenuAttribMappings;
