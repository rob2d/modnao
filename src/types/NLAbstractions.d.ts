import { TextureColorFormat, TextureSize } from '@/utils/textures';

export {};

declare global {
  interface ModNaoMemoryObject {
    address: number;
  }

  export type TextureWrappingFlags = {
    hFlip: boolean;
    vFlip: boolean;
    hRepeat: boolean;
    vRepeat: boolean;
    hStretch: boolean;
  };

  export type PolyTypeFlags = {
    culling: boolean;
    cullingType: 'front' | 'back';
    spriteQuad: boolean;
    strip: boolean;
    triangles: boolean;
    superVertexIndex: boolean;
    gouradShading: boolean;
    reuseGlobalParams: boolean;
    envMaps: boolean;
  };

  export type NLUV = [u: number, v: number];

  export type NLColor = [r: number, g: number, b: number];
  export type NLColorRGBA = [r: number, g: number, b: number, a: number];

  export type Point3D = [x: number, y: number, z: number];

  export type ModelBounds = {
    min: Point3D;
    max: Point3D;
    center: Point3D;
    size: Point3D;
    vertexCount: number;
    totalVertexCount: number;
  };

  export type NLVertex = {
    index: number;
    position: Point3D;
    normals: Point3D;
    addressingMode: 'direct' | 'reference'; // TODO: consider indexed mode?
    contentModeValue: number;
    vertexOffset: number;
    contentAddress: number;
    uv: NLUV;
    colors?: NLColorRGBA;
    alpha?: number;
  } & ModNaoMemoryObject;

  export type NLMesh = {
    baseParams: number;
    textureInstructions: number;
    polygons: NLPolygon[];
    position: Point3D;
    color: NLColor;
    alpha: number;
    specularColor: NLColor;
    specularAlpha: number;
    polygonDataLength: number;
    textureWrappingValue: number;
    textureWrappingFlags: TextureWrappingFlags;
    textureControlValue: number;
    isOpaque: boolean;
    vertexColorModeValue: number;
    hasColoredVertices: boolean;
    textureColorFormat: TextureColorFormat;
    textureColorFormatValue: number;
    textureIndex: number;
    textureSizeValue: number;
    textureSize: TextureSize;
  } & ModNaoMemoryObject;

  export type NLPolygon = {
    flags: PolyTypeFlags;
    vertices: NLVertex[];
    vertexCount: number;
    indices: number[];
    /** needed for uv atlas and wireframe triangle drawing */
    triIndices: number[];
    actualVertexCount: number;
    vertexGroupModeValue: number;
    vertexGroupMode: 'regular' | 'triple';
  } & ModNaoMemoryObject;

  export type NLModel = {
    ramAddress: number;
    position: Point3D;
    radius: number;
    meshes: NLMesh[];
    mainBounds: ModelBounds;
    totalVertexCount: number;
  } & ModNaoMemoryObject;
}

export type TextureDataUrlType = 'opaque' | 'translucent';

export type NLTextureDef = {
  width: number;
  height: number;
  colorFormat: TextureColorFormat;
  colorFormatValue: number;
  type: number;
  baseLocation: number;
  ramOffset: number;
} & ModNaoMemoryObject;

export type NLUITextureDef = NLTextureDef & {
  disableEdits?: boolean;
  bufferKeys: TextureImageBufferKeys;
  displayedAspectRatio?: number;
};
