import S from './Sizes.mjs';

/** offsets */
const O = {
  RAM: 0x0cea0000,
  Model: {
    X: 0x08,
    Y: 0x0c,
    Z: 0x10,
    RADIUS: 0x14,
    MESH: S.MODEL_HEADER,
    Mesh: {}
  }
};

O.Model.Mesh = {
  ...O.Model.Mesh,

  TEXTURE_CONTROL: O.Model.MESH + 0x10,
  TEXTURE_COLOR_MODE: O.Model.MESH + 0x0f,

  X: O.Model.MESH + 0x10,
  Y: O.Model.MESH + 0x14,
  Z: O.Model.MESH + 0x18,
  UV_FLIP: O.Model.Mesh + 0x0a,
  SRC_DIST_ALPHA: 0x0b,
  TEXTURE_CONTROL: 0x0c,
  TEXTURE_COLOR_FORMAT: O.Model.MESH + 0x0f,
  RADIUS: O.Model.MESH + 0x1c,
  TEXTURE_NUMBER: O.Model.MESH + 0x20,
  SPECULAR_LIGHT_VALUE: 0x24,
  A: O.Model.MESH + 0x2c,
  R: O.Model.MESH + 0x30,
  G: O.Model.MESH + 0x34,
  B: O.Model.MESH + 0x38,

  SPECULAR_A: O.Model.MESH + 0x3c,
  SPECULAR_R: O.Model.MESH + 0x40,
  SPECULAR_G: O.Model.MESH + 0x44,
  SPECULAR_B: O.Model.MESH + 0x48,

  MESH_DATA_LENGTH: O.Model.MESH + 0x4c,
  POLYGON_TYPE: O.Model.MESH + S.MESH
};

O.Polygon = {
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
};

export default O;
