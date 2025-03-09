/**
 * represents the data for a texture's source, stored in an
 * unique id keys
 */
export type TextureImageBuffers =
  | {
      translucent: SharedArrayBuffer;
      opaque: SharedArrayBuffer;
    }
  | {
      translucent?: undefined;
      opaque: SharedArrayBuffer;
    }
  | {
      translucent: SharedArrayBuffer;
      opaque?: undefined;
    };
