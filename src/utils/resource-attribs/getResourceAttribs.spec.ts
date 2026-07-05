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

  const mvc2DemoFiles = [
    ['18251df14af4d9ad18ef4a071c880efd722c2d91', 'DM00POL.BIN', '0x00', false],
    ['9eb8a91ce83709d1db2a2f86eb14ab388ab75834', 'DM05POL.BIN', '0x05', false],
    ['36f24126412f66e736346801634d4ba97313bea3', 'DM0APOL.BIN', '0x0A', true],
    ['36f24126412f66e736346801634d4ba97313bea3', 'DM0EPOL.BIN', '0x0E', true],
    ['2282a008873bac696ec10a59b3e58b8c1a2a5e90', 'DM12POL.BIN', '0x12', false],
    ['f886aaa8a434b54719647667b477956e346a8aa8', 'DM14POL.BIN', '0x14', false]
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

  it.each(mvc2DemoFiles)(
    'resolves %s and %s as an MVC2 demo resource',
    (hash, fileName, identifier, hasLzssTextureFile) => {
      const resourceAttribs = getResourceAttribs(hash, fileName);

      expect(resourceAttribs).toMatchObject({
        game: 'MVC2',
        identifier,
        resourceType: 'mvc2-menu',
        polygonMapped: true,
        oobReferencable: true,
        hasLzssTextureFile
      });
    }
  );

  it('resolves the CVS2 training stage polygon resource', () => {
    const resourceAttribs = getResourceAttribs(
      '1997a444821098aa2e7d15b57697c91c89f9ca69',
      'STG0APOL.BIN'
    );

    expect(resourceAttribs).toMatchObject({
      game: 'CVS2',
      name: 'Training Stage',
      identifier: '0x0A',
      resourceType: 'cvs2-stage',
      polygonMapped: true,
      hasLzssTextureFile: true
    });
  });

  it.each([
    [
      '17380856c05cbaae18b69b629012357dbb4bf4fb',
      'STG06POL.BIN',
      'New York Rooftop',
      '0x06'
    ],
    [
      '43f791dd22390ae2f60650eff4630257abf3c276',
      'STG07POL.BIN',
      'Osaka Stadium',
      '0x07'
    ],
    [
      'e873552f67383119140971060c779759709898ac',
      'STG08POL.BIN',
      'Osaka Tower Rooftop',
      '0x08'
    ],
    [
      '196944e76c46820ceb0ae02669389d670fc70019',
      'STG09POL.BIN',
      'Osaka in Flames',
      '0x09'
    ]
  ])(
    'resolves %s as a CVS2 stage polygon resource',
    (hash, fileName, name, identifier) => {
      const resourceAttribs = getResourceAttribs(hash, fileName);

      expect(resourceAttribs).toMatchObject({
        game: 'CVS2',
        name,
        identifier,
        resourceType: 'cvs2-stage',
        polygonMapped: true,
        hasLzssTextureFile: true
      });
    }
  );

  it('annotates MVC2 portrait files with the character hex slot and name', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'PL0D_FAC.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'MVC2',
      name: 'Character Portraits - Hulk',
      identifier: '0x0D',
      resourceType: 'mvc2-menu',
      textureFileType: 'mvc2-character-portraits'
    });
  });

  it('annotates MVC2 win portrait files with the character hex slot and name', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'PL1B_WIN.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'MVC2',
      name: 'Character Win Portraits - Chun-Li',
      identifier: '0x1B',
      resourceType: 'mvc2-menu',
      textureFileType: 'mvc2-character-win'
    });
  });

  it('keeps unknown stage polygon files on the generic stage fallback', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'STG03POL.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'VS2',
      resourceType: 'vs2-stage',
      hasLzssTextureFile: false
    });
  });
});
