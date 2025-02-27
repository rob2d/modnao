import { promises as fs } from 'fs';
import path from 'path';

import scanModel from './scanModel';

// @TODO use model generator for mocking when this exists

describe('scanModel', () => {
  it('extracts a test stage file predictably', async () => {
    const buffer = await fs.readFile(
      path.join(process.cwd(), 'src/__mocks__/STGXXPOL.BIN')
    );
    const modelData = scanModel({
      buffer:
        buffer.buffer instanceof ArrayBuffer
          ? buffer.buffer
          : new ArrayBuffer(0),
      address: 528,
      index: 0,
      ramAddress: 0
    });

    expect(modelData).toMatchSnapshot('scan-model-model-data');
  });
});
