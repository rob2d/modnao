import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import { h } from './rip-stage/referenceUtils.mjs';
import O from './rip-stage/Offsets.mjs';
import scanModel from './rip-stage/scanModel.mjs';

const argv = yargs(hideBin(process.argv)).argv;
const { namespace: fileNamespace } = argv;
const { output: outputPath } = argv;

const MODEL_NUMBER = 9;

if (!fileNamespace?.length) {
  console.error('Error: Must specify a "namespace" parameter');
  process.exit(1);
}

const pFilename = path.join(process.cwd(), `${fileNamespace}POL.BIN`);
const tFilename = path.join(process.cwd(), `${fileNamespace}TEX.BIN`);
const outputFilename =
  outputPath ||
  `./projects/mvc2-stage-viewer-test/${fileNamespace}POL.BIN.json`;

let buffer;
let tBuffer;

try {
  buffer = fs.readFileSync(pFilename);
} catch (error) {
  console.error(`Error: Could not access or find ${pFilename}`);
}

// note: texture mapping files are not yet used/WIP
try {
  tBuffer = fs.readFileSync(tFilename);
} catch (error) {
  console.error(`Error: Could not access or find ${tFilename}`);
}

const T = {
  ARGB1555: 0x0,
  RGB565: 0x1,
  ARGB4444: 0x2,
  YUV422: 0x3,
  BUMP: 0x4
};

const textureTypeMap = new Map();
Object.keys(T).forEach((k) => textureTypeMap.set(k, T[k]));

const nonRAM = (a) => a - O.RAM;

// map out models

const modelTablePointerAddress = nonRAM(buffer.readUInt32LE(0x0000));
const modelCount = buffer.readUInt32LE(0x0004);
const models = [];

for (let i = 0; i < modelCount; i++) {
  const pointer = modelTablePointerAddress + 4 * i;
  const address = nonRAM(buffer.readUInt32LE(pointer));
  try {
    if (i === MODEL_NUMBER) {
      console.log({ i, address: h(address) });
      const model = scanModel({ address, buffer });
      models.push(model);
    }
  } catch (error) {
    console.error(`Error: error occurred scanning model at index ${i}`);
    console.error(error);
  }
}

if (models.length < modelCount) {
  console.log(
    `Parsed ${models.length} / ${modelCount} models listed in stage data`
  );
} else {
  console.log(`Parsed all ${modelCount} models listed in stage data`);
}

const stageData = {
  modelTablePointerAddress: h(modelTablePointerAddress),
  modelNumber: MODEL_NUMBER,
  modelCount,
  models
};

fs.writeFileSync(outputFilename, JSON.stringify(stageData, null, 2));
