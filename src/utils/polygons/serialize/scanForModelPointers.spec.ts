import { promises as fs } from 'fs';
import path from 'path';

import scanForModelPointers from './scanForModelPointers';

// @TODO use model generation logic when that exists vs
// arbitrary stage test files with more methodical approach

describe('scanForModelPointers', () => {
  it('returns the correct list of model pointer addresses in a stage file', async () => {
    const polygonFile = await fs.readFile(
      path.join(process.cwd(), 'src/__mocks__/STGXXPOL.BIN')
    );

    const buffer = new SharedArrayBuffer(polygonFile.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(polygonFile));
    const results = scanForModelPointers(buffer);
    expect(results).toMatchSnapshot('scan-model-for-pointer-addresses');
  });
});
