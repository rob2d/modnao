import S from './Sizes';

/**
 * Mesh offset; is at the start after model header
 */
const MESH = S.MODEL_HEADER;

/** offsets */
const Offsets = {
  RAM: 0x0cea0000,
  Model: {
    POSITION: 0x08,
    RADIUS: 0x14,
    MESH
  },
  Mesh: {
    POSITION: 0x10,
    UV_FLIP: 0x0a,
    SRC_DIST_ALPHA: 0x0b,
    TEXTURE_CONTROL: 0x0c, // @TODO: confirm either 10 or 0C
    TEXTURE_COLOR_FORMAT: 0x0f,
    RADIUS: 0x1c,
    TEXTURE_NUMBER: 0x20,
    SPECULAR_LIGHT_VALUE: 0x24,
    ALPHA: 0x2c,
    COLOR: 0x30,

    SPECULAR_ALPHA: 0x3c,
    SPECULAR_COLOR: 0x40,

    MESH_DATA_LENGTH: 0x4c,
    POLYGON_TYPE: S.MESH
  },
  Polygon: {
    VERTEX_GROUP_TYPE: 0x00,
    VERTEX_COUNT: 0x04,

    /* 0x08 is used for NaN detection with B content mode */
    NAN_CONTENT_MODE_FLAG: 0x08,
    BASE_POINTER_OFFSET: 0x0c,

    POSITION: 0x08,

    NORMAL: 0x14,

    UV: 0x20
  }
} as const;

export default Offsets;
