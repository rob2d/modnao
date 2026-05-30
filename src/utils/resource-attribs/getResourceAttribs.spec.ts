import getResourceAttribs from './getResourceAttribs';

describe('getResourceAttribs', () => {
  const cvs1StageFiles = [
    ['6971c7f91ff9f0f83b771609451e49d7814b5388', 'STG00POL.BIN', 'STG00/STG0B'],
    ['6971c7f91ff9f0f83b771609451e49d7814b5388', 'STG0BPOL.BIN', 'STG00/STG0B'],
    ['c914cac667b9d564479b256f378eb7bf95997ec3', 'STG02POL.BIN', 'STG02'],
    ['7a3438fef9b108f5e5c904c51e4b2b29d0be0bff', 'STG04POL.BIN', 'STG04'],
    ['a3b52397da2e4011c12939fd4ff59432600434ed', 'STG05POL.BIN', 'STG05'],
    ['076811481292fdea66848bc344bdc9201df7df59', 'STG07POL.BIN', 'STG07'],
    ['fd5ff139f281e7a016bb8ece18b70816d3928934', 'STG0CPOL.BIN', 'STG0C']
  ] as const;

  const cvs1DemoFiles = [
    ['37d9fb1acd9cac80d6f786850fa6c3b4c4ca044e', 'DM00POL.BIN', true],
    ['e26c44c2c1d64b50f82f26a318bb9ff11be15a3f', 'DM01POL.BIN', true],
    ['b8af7110a4b3f52895dc0c9828431d77d0cffb93', 'DM02POL.BIN', true],
    ['2ee10db010879f59ca5aa3455e95fc889d3706a4', 'DM03POL.BIN', false],
    ['cfa1ad9b7a049d658c09fc747af6830c36b476e3', 'DM04POL.BIN', true],
    ['aab4fad2fbf430fb3fd5509cbb7bf066381a01e7', 'DM05POL.BIN', true],
    ['332b71c86b1e016b67276968c4191eaadebadcd2', 'DM06POL.BIN', true],
    ['a9733269f854135cb450acefcaa67670a4601226', 'DM07POL.BIN', true],
    ['5327708e5ecb2c549a8d1675e58d1576a3aea919', 'DM08POL.BIN', true],
    ['12e8feca65c8089018ea0a4949e331278eeb7690', 'DM09POL.BIN', true],
    ['3c66669c57920d07032420b6e11ed26511357756', 'DM10POL.BIN', true],
    ['3c66669c57920d07032420b6e11ed26511357756', 'DM75POL.BIN', true],
    ['3c66669c57920d07032420b6e11ed26511357756', 'DM88POL.BIN', true],
    ['3c66669c57920d07032420b6e11ed26511357756', 'DM91POL.BIN', true],
    ['2e57122211578849a0e64f316fdc82a222085469', 'DM20POL.BIN', true],
    ['2e57122211578849a0e64f316fdc82a222085469', 'DM24POL.BIN', true],
    ['2e57122211578849a0e64f316fdc82a222085469', 'DM92POL.BIN', true],
    ['fa1610afca1439745d929b128065ce0b55f2714f', 'DM76POL.BIN', true],
    ['bbdab340fbb21d360ef80a620eacd7c55e6810bc', 'DM77POL.BIN', true],
    ['8a2eebe2404e73936fea34587acdbeadbaa498c6', 'DM78POL.BIN', true],
    ['dda53329c0def9a81de4df2cb2decbcd22e3859f', 'DM79POL.BIN', true],
    ['4922ab47fc64eef5ee2a30621733e3e6cfae4308', 'DM80POL.BIN', true],
    ['d8fe02eae09901a05cd38c659748b17aa3f8477c', 'DM81POL.BIN', true],
    ['d8fe02eae09901a05cd38c659748b17aa3f8477c', 'DM86POL.BIN', true]
  ] as const;

  const cvs1DreamcastFiles = [
    ['452ad62f6b1a681bf1e2821047e0ec4bcd208359', 'DC00POL.BIN', 'DC00', true],
    ['09dd5e9a38f66f8e17d24d89536f7a08dec96a5d', 'DC01POL.BIN', 'DC01', true],
    [
      '3828c1c9cbbc4ecf57b2d47375ac44f485489bc7',
      'DC02POL.BIN',
      'DC02/DC13/DC14',
      true
    ],
    [
      '3828c1c9cbbc4ecf57b2d47375ac44f485489bc7',
      'DC13POL.BIN',
      'DC02/DC13/DC14',
      true
    ],
    [
      '3828c1c9cbbc4ecf57b2d47375ac44f485489bc7',
      'DC14POL.BIN',
      'DC02/DC13/DC14',
      true
    ],
    ['46ab3b79a7722f5410e9ae3927fee6f7466e36c5', 'DC03POL.BIN', 'DC03', true],
    ['b47bc2e14375874994dc56ddb1738a2fd86bdd77', 'DC04POL.BIN', 'DC04', true],
    ['59beec84ef82b9ef729d03491eaf1d4b692e011c', 'DC05POL.BIN', 'DC05', true],
    ['0f9160c70236e47fe029e67b6c320eae0a8bb0a1', 'DC06POL.BIN', 'DC06', true],
    ['25f845c1132b6c64e9ef9b408264d5ff8e1a971f', 'DC07POL.BIN', 'DC07', true],
    ['15703dcb1c83f25ac4df17f6bb2ffba0ba02817e', 'DC08POL.BIN', 'DC08', true],
    ['8479cf7fa14b4151fb3d90081185d35f0142e8fb', 'DC09POL.BIN', 'DC09', true],
    ['b8839467c810e3f271a1190d661749fcb0994f74', 'DC10POL.BIN', 'DC10', true],
    ['9d50e34716b43b9554c1f39745fc9f4f7526fa5a', 'DC11POL.BIN', 'DC11', true],
    ['46d0f1bda75d7aac95546edd12623e8a09032487', 'DC12POL.BIN', 'DC12', true],
    ['54f188c3bbdc3e6508a797edfeec5712fa240da7', 'DC19POL.BIN', 'DC19', true],
    ['c4249fbf6af80566dc66084f49d7d8eb1d585c5c', 'DC20POL.BIN', 'DC20', false],
    ['8ba015405ad5df60e8cc21eed342aeaf0babb2fe', 'DC21POL.BIN', 'DC21', true],
    ['c48c61109144051f9686d7f2231bb12a0f2c4504', 'DC22POL.BIN', 'DC22', false],
    ['3f4d6f623d3a137ad0f5af8a0a5ded7d6a63618a', 'DC23POL.BIN', 'DC23', true]
  ] as const;

  it.each(cvs1StageFiles)(
    'resolves %s and %s as a CVS1 stage resource',
    (hash, fileName, identifier) => {
      const resourceAttribs = getResourceAttribs(hash, fileName);

      expect(resourceAttribs).toMatchObject({
        game: 'CVS1Pro',
        identifier,
        resourceType: 'cvs1-stage',
        polygonMapped: true,
        hasLzssTextureFile: true
      });
    }
  );

  it.each(cvs1DemoFiles)(
    'resolves %s and %s as a CVS1 demo resource',
    (hash, fileName, hasLzssTextureFile) => {
      const resourceAttribs = getResourceAttribs(hash, fileName);

      expect(resourceAttribs).toMatchObject({
        game: 'CVS1Pro',
        resourceType: 'cvs1-demo',
        polygonMapped: true,
        hasLzssTextureFile
      });
    }
  );

  it.each(cvs1DreamcastFiles)(
    'resolves %s and %s as a CVS1 Dreamcast menu resource',
    (hash, fileName, identifier, hasLzssTextureFile) => {
      const resourceAttribs = getResourceAttribs(hash, fileName);

      expect(resourceAttribs).toMatchObject({
        game: 'CVS1Pro',
        identifier,
        resourceType: 'cvs1-menu',
        polygonMapped: true,
        hasLzssTextureFile
      });
    }
  );

  it('keeps unknown stage polygon files on the generic stage fallback', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'STG03POL.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'VS2',
      resourceType: 'vs2-stage',
      hasLzssTextureFile: false
    });
  });

  it('resolves CVS1 standalone stage textures by filename without per-file texture types', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'ST00TEX.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'CVS1Pro',
      identifier: 'ST00',
      resourceType: 'cvs1-stage',
      polygonMapped: false,
      textureFileType: 'cvs1-stage-textures',
      hasLzssTextureFile: true
    });
    expect(resourceAttribs?.textureShapesMap).toHaveLength(67);
  });

  it('resolves SFA3 PAC files by filename without per-file texture types', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'ST00.PAC');

    expect(resourceAttribs).toMatchObject({
      game: 'SFA3',
      identifier: 'ST00',
      resourceType: 'sfa3-stage',
      polygonMapped: false,
      textureFileType: 'sfa3-stage-pac',
      hasLzssTextureFile: false
    });
    expect(resourceAttribs?.textureShapesMap).toHaveLength(6);
  });
});
