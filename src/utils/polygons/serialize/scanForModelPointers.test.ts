import { promises as fs } from 'fs';
import path from 'path';

import scanForModelPointers from './scanForModelPointers';

// @TODO use model generation logic when that exists vs
// arbitrary stage test files with more methodical approach

describe('scanForModelPointers', () => {
  it('returns the correct list of model pointer addresses in a stage file', async () => {
    const polygonFile = await fs.readFile(
      path.join(__dirname, '../../../__mocks__/STGXXPOL.BIN')
    );

    const results = scanForModelPointers(polygonFile);
    expect(results).toMatchSnapshot('scan-model-for-pointer-addresses');
  });
});
