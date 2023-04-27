export default modelMappings = {
  position: [
    [0x08, 'FloatLE'],
    [0x0c, 'FloatLE'],
    [0x10, 'FloatLE']
  ],
  radius: [0x1c, 'FloatLE'],
  mesh: {
    textureFlagsValue: [0x08, 'UInt32LE'],
    textureWrapping: [0x0a, 'UInt8'],
    textureControlValue: [0x0c, 'UInt32LE'],
    textureColorFormat: [0x0f, 'UInt8'],
    textureNumber: [0x20, 'UInt8'],
    specularLightValue: [0x24, 'FloatLE'],
    position: [
      [0x10, 'FloatLE'],
      [0x14, 'FloatLE'],
      [0x18, 'FloatLE']
    ],
    alpha: [0x2c, 'FloatLE'],
    color: [
      [0x30, 'FloatLE'],
      [0x34, 'FloatLE'],
      [0x38, 'FloatLE']
    ],
    polygonDataLength: [0x4c, 'UInt32LE'],
    polygon: {
      vertexGroupMode: [0x00, 'UInt32LE'],
      vertexCount: [0x04, 'UInt32LE'],
      vertex: {
        nanContentModeFlag: [0x00, 'UInt32LE'],
        vertexOffset: [0x04, 'UInt32LE'],
        position: [
          [0x00, 'FloatLE'],
          [0x04, 'FloatLE'],
          [0x08, 'FloatLE']
        ],
        normal: [
          [0x0c, 'FloatLE'],
          [0x10, 'FloatLE'],
          [0x14, 'FloatLE']
        ],
        uv: [
          [0x18, 'FloatLE'],
          [0x1c, 'FloatLE']
        ]
      }
    }
  }
};
