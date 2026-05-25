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

  it('keeps unknown stage polygon files on the generic stage fallback', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'STG03POL.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'VS2',
      resourceType: 'vs2-stage',
      hasLzssTextureFile: false
    });
  });
});
