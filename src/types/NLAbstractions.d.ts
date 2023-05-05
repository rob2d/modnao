export {};

declare global {
  // TODO: create namespace for all types
  // that should be reasonably global in
  // app e.g. NLModel types

  export type TextureWrappingFlags = {
    hFlip: boolean;
    vFlip: boolean;
    hRepeat: boolean;
    vRepeat: boolean;
    hStretch: boolean;
  };

  export type NLUV = [u: number, v: number];

  export type NLColor = [r: number, g: number, b: number];

  export type NLPoint3D = [x: number, y: number, z: number];

  export type NLVertex = {
    position: NLPoint3D;
    normals: NLPoint3D;
    address: number;
    contentModeValue: number;
    contentMode: 'a' | 'b';
    vertexOffset: number;
    contentAddress: number;
    uv: NLUV;
  };

  export type NLMesh = {
    polygons: NLPolygon[];
    position: NLPoint3D;
    color: NLColor;
    alpha: number;
    specularLightValue: number;
    polygonDataLength: number;
    textureWrappingValue: number;
    textureWrappingFlags: TextureWrappingFlags;
    textureControlValue: number; // @TODO: enumerate possible values
    textureColorFormat: number; // @TODO enumerate possible values
    textureNumber: number;
  };

  export type NLPolygon = {
    address: number;
    vertexes: NLVertex[];
    vertexCount: number;
    vertexGroupModeValue: number;
    vertexGroupMode: 'regular' | 'triple';
  };

  export type NLModel = {
    address: number;
    position: NLPoint3D;
    radius: number;
    meshes: NLMesh[];
  };
}
