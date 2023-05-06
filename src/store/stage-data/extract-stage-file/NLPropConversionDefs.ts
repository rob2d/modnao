export type BinFileReadOp =
  | Buffer['readFloatLE']
  | Buffer['readUInt8']
  | Buffer['readUInt32LE'];

export type NLPropConversion<T extends ModNaoMemoryObject> = {
  targetOffset: number;
  readOps: BinFileReadOp[];
  updates: (model: DeepPartial<T>, values: number[]) => void;
};

const { readUInt8, readUInt32LE, readFloatLE } = Buffer.prototype;

export const BinFileReadOpSizes = new Map<BinFileReadOp, number>([
  [readUInt8, 1],
  [readFloatLE, 4],
  [readUInt32LE, 4]
]);

export const NLModelConversions: NLPropConversion<NLModel>[] = [
  {
    targetOffset: 0x08,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates: (model, values) => {
      model.position = values as NLPoint3D;
    }
  },
  {
    targetOffset: 0x1c,
    readOps: [readFloatLE],
    updates: (model, values) => {
      model.radius = values[0];
    }
  }
];

export const NLMeshConversions: NLPropConversion<NLMesh>[] = [
  {
    targetOffset: 0x08,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(mesh, values) {
      // @TODO: determine what to update in NLMesh
    }
  },
  {
    targetOffset: 0x0a,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureWrappingValue = value;
    }
  },
  {
    targetOffset: 0x0c,
    readOps: [readUInt32LE],
    updates(model: NLMesh, [value]) {
      model.textureControlValue = value;
    }
  },
  {
    targetOffset: 0x0f,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureColorFormat = value;
    }
  },
  {
    targetOffset: 0x0f,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureColorFormat = value;
    }
  },
  {
    targetOffset: 0x10,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(mesh: NLMesh, values: number[]) {
      mesh.position = values as NLPoint3D;
    }
  },
  {
    targetOffset: 0x20,
    readOps: [readUInt8],
    updates(mesh, [value]) {
      mesh.textureNumber = value;
    }
  },
  {
    targetOffset: 0x24,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.specularLightValue = value;
    }
  },
  {
    targetOffset: 0x2c,
    readOps: [readFloatLE],
    updates(mesh: NLMesh, [value]) {
      mesh.alpha = value;
    }
  },
  {
    targetOffset: 0x30,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(model: NLMesh, values) {
      model.color = values as [number, number, number];
    }
  },
  {
    targetOffset: 0x4c,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.polygonDataLength = value;
    }
  }
];

export const NLPolygonConversions: NLPropConversion<NLPolygon>[] = [
  {
    targetOffset: 0x00,
    readOps: [readUInt32LE],
    updates(polygon, [value]) {
      const binVertexGroup = [...`${value.toString(2)}`]
        .reverse()
        .join()
        .padStart(8, '0');

      const isTripleGroupMode =
        binVertexGroup[1] === '1' || polygon.vertexGroupModeValue === 0x0a;

      polygon.vertexGroupModeValue = value;
      polygon.vertexGroupMode = !isTripleGroupMode ? 'regular' : 'triple';
    }
  },
  {
    targetOffset: 0x04,
    readOps: [readUInt32LE],
    updates(polygon, [value]) {
      polygon.vertexCount = value;
      polygon.actualVertexCount =
        value * (polygon.vertexGroupMode == 'triple' ? 3 : 1);
    }
  }
];

export function parseNLConversions<T extends ModNaoMemoryObject>(
  converters: NLPropConversion<T>[],
  buffer: Buffer,
  baseAddress: number
): T {
  const object = {} as DeepPartial<T>;

  for (const { targetOffset, readOps, updates } of converters) {
    let workingAddress = baseAddress + targetOffset;
    const values: number[] = [];

    readOps.forEach((op: BinFileReadOp) => {
      values.push(op.call(buffer, workingAddress));
      workingAddress += BinFileReadOpSizes.get(op) || 0;
    });

    updates(object, values);
  }

  object.address = baseAddress;

  return object as T;
}
