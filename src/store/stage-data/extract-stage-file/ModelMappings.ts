export type BufferReadOp = 'readFloatLE' | 'readUInt8' | 'readUInt32LE';

// @TODO: deprecate ModelMappings using WIP converter pipeline

export type ModelPropertyMapping = [
  address: number,
  bufferReadOp: BufferReadOp
];

const ModelMappings = {
  position: [
    [0x08, 'readFloatLE'],
    [0x0c, 'readFloatLE'],
    [0x10, 'readFloatLE']
  ] as ModelPropertyMapping[],
  radius: [0x1c, 'readFloatLE'] as ModelPropertyMapping,
  mesh: {
    textureFlagsValue: [0x08, 'readUInt32LE'] as ModelPropertyMapping,
    textureWrapping: [0x0a, 'readUInt8'] as ModelPropertyMapping,
    textureControlValue: [0x0c, 'readUInt32LE'] as ModelPropertyMapping,
    textureColorFormat: [0x0f, 'readUInt8'] as ModelPropertyMapping,
    textureNumber: [0x20, 'readUInt8'] as ModelPropertyMapping,
    specularLightValue: [0x24, 'readFloatLE'] as ModelPropertyMapping,
    position: [
      [0x10, 'readFloatLE'],
      [0x14, 'readFloatLE'],
      [0x18, 'readFloatLE']
    ] as ModelPropertyMapping[],
    alpha: [0x2c, 'readFloatLE'] as ModelPropertyMapping,
    color: [
      [0x30, 'readFloatLE'],
      [0x34, 'readFloatLE'],
      [0x38, 'readFloatLE']
    ] as ModelPropertyMapping[],
    polygonDataLength: [0x4c, 'readUInt32LE'] as ModelPropertyMapping,
    polygon: {
      vertexGroupMode: [0x00, 'readUInt32LE'] as ModelPropertyMapping,
      vertexCount: [0x04, 'readUInt32LE'] as ModelPropertyMapping,
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
  }
} as const;
export default ModelMappings;
