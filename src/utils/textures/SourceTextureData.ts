/**
 * represents the data for a texture's source, stored in an
 * objectURL for both translucent and opaque versions
 */
export type SourceTextureData =
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
