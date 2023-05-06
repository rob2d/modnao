export type BufferReadOp = 'readFloatLE' | 'readUInt8' | 'readUInt32LE';

// @TODO: deprecate ModelMappings using WIP conversion pipeline

export type ModelPropertyMapping = [
  address: number,
  bufferReadOp: BufferReadOp
];

const ModelMappings = {
  mesh: {
    polygonDataLength: [0x4c, 'readUInt32LE'] as ModelPropertyMapping,
    vertex: {
      nanContentModeFlag: [0x00, 'readUInt32LE'] as ModelPropertyMapping,
      vertexOffset: [0x04, 'readUInt32LE'] as ModelPropertyMapping,
      position: [
        [0x00, 'readFloatLE'],
        [0x04, 'readFloatLE'],
        [0x08, 'readFloatLE']
      ] as ModelPropertyMapping[],
      normals: [
        [0x0c, 'readFloatLE'],
        [0x10, 'readFloatLE'],
        [0x14, 'readFloatLE']
      ] as ModelPropertyMapping[],
      uv: [
        [0x18, 'readFloatLE'],
        [0x1c, 'readFloatLE']
      ] as ModelPropertyMapping[]
    }
  }
} as const;
export default ModelMappings;
