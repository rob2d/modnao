import S from './Sizes';

/**
 * Mesh offset; is at the start after model header
 */
const MESH = S.MODEL_HEADER;

/** offsets */
const Offsets = {
  RAM: 0x0cea0000,
  Model: {
    X: 0x08,
    Y: 0x0c,
    Z: 0x10,
    RADIUS: 0x14,
    MESH,
    Mesh: {
      X: 0x10,
      Y: 0x14,
      Z: 0x18,
      UV_FLIP: 0x0a,
      SRC_DIST_ALPHA: 0x0b,
      TEXTURE_CONTROL: 0x0c, // @TODO: confirm either 10 or 0C
      TEXTURE_COLOR_FORMAT: 0x0f,
      RADIUS: 0x1c,
      TEXTURE_NUMBER: 0x20,
      SPECULAR_LIGHT_VALUE: 0x24,
      A: 0x2c,
      R: 0x30,
      G: 0x34,
      B: 0x38,

      SPECULAR_A: 0x3c,
      SPECULAR_R: 0x40,
      SPECULAR_G: 0x44,
      SPECULAR_B: 0x48,

      MESH_DATA_LENGTH: 0x4c,
      POLYGON_TYPE: S.MESH
    }
  },
  Polygon: {
    VERTEX_GROUP_TYPE: 0x00,
    VERTEX_COUNT: 0x04,

    /* 0x08 is used for NaN detection with B content mode */
    NAN_CONTENT_MODE_FLAG: 0x08,
    BASE_POINTER_OFFSET: 0x0c,

    X: 0x08,
    Y: 0x0c,
    Z: 0x10,

    X_NORMAL: 0x14,
    Y_NORMAL: 0x18,
    Z_NORMAL: 0x1c,

    U: 0x20,
    V: 0x24
  }
} as const;

export default Offsets;
