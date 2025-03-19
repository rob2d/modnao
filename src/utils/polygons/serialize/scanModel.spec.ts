import { promises as fs } from 'fs';
import path from 'path';

import scanModel from './scanModel';

// @TODO use model generator for mocking when this exists

describe('scanModel', () => {
  it('extracts a test stage file predictably', async () => {
    const fileBuffer = await fs.readFile(
      path.join(process.cwd(), 'src/__mocks__/STGXXPOL.BIN')
    );

    const buffer = new SharedArrayBuffer(fileBuffer.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(fileBuffer));
    const modelData = scanModel({
      buffer,
      address: 528,
      index: 0,
      ramAddress: 0
    });

    expect(modelData).toMatchSnapshot('scan-model-model-data');
  });
});
