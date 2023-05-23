import { TextureColorFormat } from '@/utils/textures/serialize/TextureColorFormat';
import { TextureSize } from '@/utils/textures/TextureSize';

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

  export type NLUV = [u: number, v: number];

  export type NLColor = [r: number, g: number, b: number];

  export type NLPoint3D = [x: number, y: number, z: number];

  export type NLVertex = {
    index: number;
    position: NLPoint3D;
    normals: NLPoint3D;
    addressingMode: 'direct' | 'reference'; // TODO: consider indexed mode?
    contentModeValue: number;
    vertexOffset: number;
    contentAddress: number;
    uv: NLUV;
  } & ModNaoMemoryObject;

  export type NLMesh = {
    baseParams: number;
    textureInstructions: number;
    polygons: NLPolygon[];
    position: NLPoint3D;
    color: NLColor;
    alpha: number;
    textureShadingValue: number;
    polygonDataLength: number;
    textureWrappingValue: number;
    textureWrappingFlags: TextureWrappingFlags;
    textureControlValue: number;
    textureAlphaControlValue: number;
    isOpaque: boolean;
    textureColorFormat: TextureColorFormat;
    textureColorFormatValue: number;
    textureIndex: number;
    textureSizeValue: number;
    textureSize: TextureSize;
  } & ModNaoMemoryObject;

  export type NLPolygon = {
    vertexes: NLVertex[];
    vertexCount: number;
    actualVertexCount: number;
    vertexGroupModeValue: number;
    vertexGroupMode: 'regular' | 'triple';
  } & ModNaoMemoryObject;

  export type NLModel = {
    position: NLPoint3D;
    radius: number;
    meshes: NLMesh[];
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
  location: number;
  dataUrls: { opaque?: string; translucent?: string };
} & ModNaoMemoryObject;
