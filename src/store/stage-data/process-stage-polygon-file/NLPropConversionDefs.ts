import { NLTextureDef } from '@/types/NLAbstractions';
import O from '@/constants/StructOffsets';
import S from '@/constants/StructSizes';
import {
  getTextureColorFormat,
  getTextureSize,
  getTextureWrappingFlags
} from '@/utils/textures/parse';
import getVertexAddressingMode from './getVertexAddressingMode';

export type BinFileReadOp =
  | Buffer['readFloatLE']
  | Buffer['readFloatBE']
  | Buffer['readUInt8']
  | Buffer['readInt8']
  | Buffer['readUInt16LE']
  | Buffer['readInt32LE']
  | Buffer['readInt32BE']
  | Buffer['readUInt32LE']
  | Buffer['readUInt32BE'];

export type NLPropConversion<T extends ModNaoMemoryObject> = {
  condition?: (object: DeepPartial<T>) => boolean;
  /**
   * if defined, ignore the address in calculating and use targetOffset as
   * the actual address of property to scan
   */
  useOffsetAsBase?: boolean;
  targetOffset: number | ((object: DeepPartial<T>, address: number) => number);
  readOps: BinFileReadOp[];
  updates: (model: T, values: number[]) => void;
};

const {
  readInt8,
  readUInt8,
  readUInt16LE,
  readUInt32LE,
  readUInt32BE,
  readInt32LE,
  readFloatLE,
  readFloatBE
} = Buffer.prototype;

export const BinFileReadOpSizes = new Map<BinFileReadOp, number>([
  [readUInt8, 1],
  [readUInt16LE, 2],
  [readFloatLE, 4],
  [readFloatBE, 4],
  [readUInt32LE, 4],
  [readInt32LE, 4],
  [readUInt32BE, 4]
]);

// while sorting mesh logic, parse undefined
// positions as 0 to prevent THREE errors
const parseNLPoint3D = (values: number[]) =>
  values.map((v: number) =>
    typeof v !== 'number' || isNaN(v) ? 0 : v
  ) as NLPoint3D;

export const nlModelConversions: NLPropConversion<NLModel>[] = [
  {
    targetOffset: O.Model.POSITION,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates: (model, values) => {
      model.position = parseNLPoint3D(values);
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

export const nlMeshConversions: NLPropConversion<NLMesh>[] = [
  {
    targetOffset: O.Mesh.BASE_PARAMETERS,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.baseParams = value;
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_INSTRUCTIONS,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.textureInstructions = value;
      mesh.isOpaque = false;

      // TODO: streamline deduction of this;
      // probably a simple bitflag
      if (value === 0x83000000) {
        switch (mesh.baseParams) {
          case 0x8000001c:
          case 0x8000002c:
          case 0x8000003c:
          case 0x8000009c:
          case 0x800000ac:
          case 0x800000bc:
            mesh.isOpaque = true;
            break;
          default:
            break;
        }
      }

      if (value === 0x83400000) {
        switch (mesh.baseParams) {
          case 0x8000001d:
          case 0x8000002d:
          case 0x8000003d:
          case 0x8000009d:
          case 0x800000ad:
          case 0x800000bd:
            mesh.isOpaque = true;
            break;
          default:
            break;
        }
      }
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_SIZE,
    readOps: [readUInt8],
    updates(mesh, [value]) {
      mesh.textureSizeValue = value;
      mesh.textureSize = getTextureSize(value);
    }
  },
  {
    targetOffset: O.Mesh.UV_FLIP,
    readOps: [readUInt8],
    updates(mesh, [value]) {
      mesh.textureWrappingValue = value;
      mesh.textureWrappingFlags = getTextureWrappingFlags(value);
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_CONTROL,
    readOps: [readUInt32LE],
    updates(mesh: NLMesh, [value]) {
      mesh.textureControlValue = value;
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_COLOR_FORMAT,
    readOps: [readUInt8],
    updates(model, [value]) {
      model.textureColorFormatValue = value;
      model.textureColorFormat = getTextureColorFormat(value);
    }
  },
  {
    targetOffset: O.Mesh.POSITION,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(mesh: NLMesh, values: number[]) {
      mesh.position = parseNLPoint3D(values as NLPoint3D);
    }
  },
  {
    targetOffset: O.Mesh.TEXTURE_NUMBER,
    readOps: [readUInt8],
    updates(mesh, [value]) {
      mesh.textureIndex = value;
    }
  },
  {
    targetOffset: O.Mesh.VERTEX_COLOR_MODE,
    readOps: [readInt32LE],
    updates(mesh, [value]) {
      mesh.vertexColorModeValue = value;
      mesh.hasColoredVertices = value === -3;
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
    targetOffset: O.Mesh.VERTEX_DATA_LENGTH,
    readOps: [readUInt32LE],
    updates(mesh, [value]) {
      mesh.polygonDataLength = value;
    }
  }
];

export const nlPolygonConversions: NLPropConversion<NLPolygon>[] = [
  {
    targetOffset: O.Polygon.VERTEX_GROUP_TYPE,
    readOps: [readUInt32LE],
    updates(polygon, [value]) {
      polygon.vertexGroupModeValue = value;

      const isTripleGroupMode = ((value >> 3) & 1) == 1;
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

export const commonVertexConversions: NLPropConversion<NLVertex>[] = [
  {
    targetOffset: O.Vertex.NAN_CONTENT_MODE_FLAG,
    readOps: [readUInt32LE],
    updates(vertex, [value]) {
      vertex.contentModeValue = value;
      vertex.addressingMode = getVertexAddressingMode(value);
      vertex.contentAddress = vertex.address;
    }
  },

  // if this is a B vertex addressing-mode,
  // then set the offset to a calculation
  // w 32-bit big-endian address diffed
  {
    condition: (v) => v.addressingMode === 'reference',
    targetOffset: O.Vertex.VERTEX_OFFSET_VAR,
    readOps: [readInt32LE],
    updates(v, [value]) {
      v.vertexOffset = value;
      v.contentAddress = (v.address as number) + value + S.POLYGON_HEADER;
    }
  },
  {
    targetOffset: (v, address) =>
      (v.contentAddress || address) + O.Vertex.POSITION,
    useOffsetAsBase: true,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    updates(vertex, values) {
      if (vertex.addressingMode === 'reference') {
      }
      vertex.position = parseNLPoint3D(values);
    }
  },
  {
    targetOffset: (v, address) => (v.contentAddress || address) + O.Vertex.UV,
    readOps: [readFloatLE, readFloatLE],
    useOffsetAsBase: true,
    updates(vertex, values) {
      vertex.uv = values as NLUV;
    }
  }
];

export const nlVertexConversions: NLPropConversion<NLVertex>[] = [
  ...commonVertexConversions,
  {
    targetOffset: (v, address) =>
      (v.contentAddress || address) + O.Vertex.NORMALS,
    readOps: [readFloatLE, readFloatLE, readFloatLE],
    useOffsetAsBase: true,
    updates(vertex, values) {
      vertex.normals = values as [number, number, number];
    }
  }
];

export const nlColoredVertexConversions: NLPropConversion<NLVertex>[] = [
  ...commonVertexConversions,
  {
    targetOffset: (v, address) =>
      (v.contentAddress || address) + O.Vertex.NORMALS,
    readOps: [readInt8, readInt8, readInt8],
    useOffsetAsBase: true,
    updates(vertex, values) {
      // normals use a special encoding where we
      // must convert signed 8 bit numbers into float
      vertex.normals = values.map((v: number) =>
        v > 0x7f ? (v - 0x100) / 0x80 : v / 0x7f
      ) as [number, number, number];

    }
  }
];

export const nlTextureDefConversions: NLPropConversion<NLTextureDef>[] = [
  {
    targetOffset: O.TextureDef.WIDTH,
    readOps: [readUInt16LE],
    updates(texture, [value]) {
      texture.height = value;
      texture.width = value;
    }
  },
  {
    targetOffset: O.TextureDef.HEIGHT,
    readOps: [readUInt16LE],
    updates(texture, [value]) {
      texture.height = value;
    }
  },
  {
    targetOffset: O.TextureDef.COLOR_FORMAT,
    readOps: [readUInt8],
    updates(texture, [value]) {
      texture.colorFormatValue = value;
      texture.colorFormat = getTextureColorFormat(value);
    }
  },
  {
    targetOffset: O.TextureDef.TYPE,
    readOps: [readUInt8],
    updates(texture, [value]) {
      texture.type = value;
    }
  },
  {
    targetOffset: O.TextureDef.LOCATION,
    readOps: [readUInt32LE],
    updates(texture, [value]) {
      texture.baseLocation = value;
    }
  }
];
