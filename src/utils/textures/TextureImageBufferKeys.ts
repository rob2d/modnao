/**
 * represents the data for a texture's source, stored in
 * unique id keys for both translucent and opaque versions
 * that can be referenced by globalBuffers
 */
export type TextureImageBufferKeys =
  | {
      translucent: string;
      opaque: string;
    }
  | {
      translucent?: undefined;
      opaque: string;
    }
  | {
      translucent: string;
      opaque?: undefined;
    };
