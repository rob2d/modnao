import S from './StructSizes';

/**
 * Mesh offset; is at the start after model header
 */
const MESH = S.MODEL_HEADER;

/** offsets */
const Offsets = {
  Model: {
    POSITION: 0x08,
    RADIUS: 0x14,
    MESH
  },
  Mesh: {
    BASE_PARAMETERS: 0x00,
    TEXTURE_INSTRUCTIONS: 0x04,
    POSITION: 0x10,
    UV_FLIP: 0x0a,
    TEXTURE_SIZE: 0x08,
    SRC_DIST_ALPHA: 0x0b,
    TEXTURE_CONTROL: 0x0c, // @TODO: confirm either 10 or 0C
    TEXTURE_COLOR_FORMAT: 0x0f,
    RADIUS: 0x1c,
    TEXTURE_NUMBER: 0x20,
    ALPHA: 0x2c,
    COLOR: 0x30,
    VERTEX_COLOR_MODE: 0x24,
    SPECULAR_ALPHA: 0x3c,
    SPECULAR_COLOR: 0x40,
    VERTEX_DATA_LENGTH: 0x4c,
    POLYGON_TYPE: S.MESH
  },
  Polygon: {
    VERTEX_GROUP_TYPE: 0x00,
    VERTEX_COUNT: 0x04,
    /* 0x08 is used for NaN detection with B content mode */
    NAN_CONTENT_MODE_FLAG: 0x08,
    BASE_POINTER_OFFSET: 0x0c
  },
  Vertex: {
    // common vertex flags
    NAN_CONTENT_MODE_FLAG: 0x00,
    VERTEX_OFFSET_VAR: 0x04,
    POSITION: 0x00,
    UV: 0x18,
    // colored vertices
    NORMALS: 0x0c,
    COLORS: 0x10
  },
  TextureDef: {
    WIDTH: 0x00,
    HEIGHT: 0x02,
    COLOR_FORMAT: 0x04,
    TYPE: 0x05,
    LOCATION: 0x08
  }
} as const;

export default Offsets;
