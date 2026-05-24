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

  it('keeps unknown stage polygon files on the generic stage fallback', () => {
    const resourceAttribs = getResourceAttribs('unknown', 'STG03POL.BIN');

    expect(resourceAttribs).toMatchObject({
      game: 'VS2',
      resourceType: 'vs2-stage',
      hasLzssTextureFile: false
    });
  });
});
