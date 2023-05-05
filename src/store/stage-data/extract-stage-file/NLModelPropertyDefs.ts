export type BinFileReadOp =
  | Buffer['readFloatLE']
  | Buffer['readUInt8']
  | Buffer['readUInt32LE'];

export type NLModelPropertyDef<T> = {
  targetOffset: number;
} & (
  | {
      readOp: BinFileReadOp;
      update: (model: T, value: number) => void;
    }
  | {
      readOp: BinFileReadOp[];
      update: (model: T, values: number[]) => void;
    }
);

const { readUInt8, readUInt32LE, readFloatLE } = Buffer.prototype;

export const NLModelPropertyDefs: NLModelPropertyDef<NLModel>[] = [
  {
    targetOffset: 0x08,
    readOp: [readFloatLE, readFloatLE, readFloatLE],
    update: (model: NLModel, values: number[]) => {
      model.position = values as NLPoint3D;
    }
  },
  {
    targetOffset: 0x1c,
    readOp: readFloatLE,
    update: (model: NLModel, value: number) => {
      model.radius = value;
    }
  }
];

export const NLMeshPropertyDefs: NLModelPropertyDef<NLMesh>[] = [
  {
    targetOffset: 0x08,
    readOp: [readFloatLE, readFloatLE, readFloatLE],
    update: (mesh: NLMesh, values: number[]) => {
      // determine what to update in NLMesh
    }
  },
  {
    targetOffset: 0x0a,
    readOp: readUInt8,
    update: (model: NLMesh, value: number) => {
      model.textureWrappingValue = value;
    }
  },
  {
    targetOffset: 0x0c,
    readOp: readUInt32LE,
    update: (model: NLMesh, value: number) => {
      model.textureControlValue = value;
    }
  },
  {
    targetOffset: 0x0f,
    readOp: readUInt8,
    update: (model: NLMesh, value: number) => {
      model.textureColorFormat = value;
    }
  },
  {
    targetOffset: 0x0f,
    readOp: readUInt8,
    update: (model: NLMesh, value: number) => {
      model.textureColorFormat = value;
    }
  }
];
