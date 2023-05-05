export type BinFileReadOp =
  | Buffer['readFloatLE']
  | Buffer['readUInt8']
  | Buffer['readUInt32LE'];

export type NLPropertySerializer<T> = {
  targetOffset: number;
  readOps: BinFileReadOp[];
  updates: (model: T, values: number[]) => void;
};

const { readUInt8, readUInt32LE, readFloatLE } = Buffer.prototype;

export const NLModelPropertyDefs: NLPropertySerializer<NLModel>[] = [
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

export const NLMeshPropertyDefs: NLPropertySerializer<NLMesh>[] = [
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

export const NLPolygonPropertyDefs: NLPropertySerializer<NLPolygon>[] = [
  {
    targetOffset: 0x00,
    readOps: [readUInt32LE],
    updates(polygon, [value]) {
      const binVertexGroup = [...`${polygon.vertexGroupModeValue.toString(2)}`]
        .reverse()
        .join()
        .padStart(8, '0');

      const isTripleGroupMode =
        binVertexGroup[1] === '1' || polygon.vertexGroupModeValue === 0x0a;

      polygon.vertexGroupModeValue = value;
      polygon.vertexGroupMode = !isTripleGroupMode ? 'regular' : 'triple';
    }
  }
];
