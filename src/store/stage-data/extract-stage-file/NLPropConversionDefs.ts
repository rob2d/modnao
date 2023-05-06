import O from './Offsets';

export type BinFileReadOp =
  | Buffer['readFloatLE']
  | Buffer['readUInt8']
  | Buffer['readUInt32LE'];

export type NLPropConversion<T extends ModNaoMemoryObject> = {
  condition?: (object: DeepPartial<T>) => boolean;
  targetOffset: number | ((object: DeepPartial<T>) => number);
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
    targetOffset: O.Model.POSITION,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates: (model, values) => {
      model.position = values as NLPoint3D;
    }
  },
  {
    targetOffset: O.Model.RADIUS,
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
    targetOffset: O.Mesh.UV_FLIP,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureWrappingValue = value;
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_CONTROL,
    readOps: [readUInt32LE],
    updates(model: NLMesh, [value]) {
      model.textureControlValue = value;
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_COLOR_FORMAT,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureColorFormat = value;
    }
  },
  {
    targetOffset: O.Mesh.POSITION,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(mesh: NLMesh, values: number[]) {
      mesh.position = values as NLPoint3D;
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_NUMBER,
    readOps: [readUInt8],
    updates(mesh, [value]) {
      mesh.textureNumber = value;
    }
  },
  {
    targetOffset: O.Mesh.SPECULAR_LIGHT_VALUE,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.specularLightValue = value;
    }
  },
  {
    targetOffset: O.Mesh.ALPHA,
    readOps: [readFloatLE],
    updates(mesh: NLMesh, [value]) {
      mesh.alpha = value;
    }
  },
  {
    targetOffset: O.Mesh.COLOR,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(model: NLMesh, values) {
      model.color = values as [number, number, number];
    }
  },
  {
    targetOffset: O.Mesh.MESH_DATA_LENGTH,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.polygonDataLength = value;
    }
  }
];

export const NLPolygonConversions: NLPropConversion<NLPolygon>[] = [
  {
    targetOffset: O.Polygon.VERTEX_GROUP_TYPE,
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
    targetOffset: O.Polygon.VERTEX_COUNT,
    readOps: [readUInt32LE],
    updates(polygon, [value]) {
      polygon.vertexCount = value;
      polygon.actualVertexCount =
        value * (polygon.vertexGroupMode == 'triple' ? 3 : 1);
    }
  }
];

// @TODO: populate and use in scanModel logic
export const NLVertexConversions: NLPropConversion<NLVertex>[] = [];
