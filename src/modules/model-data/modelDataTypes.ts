import type {
  AsyncState,
  NLUITextureDef,
  ResourceAttribs,
  TextureFileType
} from '@/types';
import {
  HslValues,
  TextureImageBufferKeys,
  UvClipPath
} from '@/utils/textures';

export type EditedTexture = {
  width: number;
  height: number;
  bufferKeys: TextureImageBufferKeys;
  hsl: HslValues;
  uvClipPathKey?: string;
};

export interface TextureHslSession {
  scopeKey: string;
  sourceBufferKeys: TextureImageBufferKeys;
  hsl: HslValues;
}

export interface LoadTexturesBasePayload {
  textureFileType: TextureFileType;
  resourceAttribs?: ResourceAttribs;
  isLzssCompressed?: boolean;
}

export type LoadTexturesPayload = LoadTexturesBasePayload & {
  file: File;
  textureBuffer?: SharedArrayBuffer;
  textureDefs?: NLUITextureDef[];
};

export type LoadTexturesResultPayload = LoadTexturesBasePayload & {
  fileName: string;
  textureBufferKey: string;
  textureDefs: NLUITextureDef[];
};

export type LoadPolygonsResultPayload = {
  models: NLModel[];
  originalModels: NLModel[];
  textureDefs: NLUITextureDef[];
  fileName: string;
  polygonBufferKey: string;
  resourceAttribs?: ResourceAttribs;
};

export type LoadPolygonsPayload =
  | {
      models: NLModel[];
      originalModels: NLModel[];
      textureDefs: NLUITextureDef[];
      fileName: string;
      polygonBufferKey: string;
      resourceAttribs?: ResourceAttribs;
    }
  | {
      models: [];
      originalModels: [];
      textureDefs: NLUITextureDef[];
      fileName: undefined;
      polygonBufferKey: undefined;
      resourceAttribs?: ResourceAttribs;
    };

export type AdjustTextureHslPayload = {
  textureIndex: number;
  bufferKeys: TextureImageBufferKeys;
  hsl: HslValues;
  uvClipPaths?: UvClipPath[];
};

export interface VertexColorUpdate {
  contentAddress: number;
  color: NLColorRGBA;
}

export interface SelectedVertexGradientInput {
  contentAddress: number;
  position: Point3D;
  alpha: number;
}

export interface SelectedVertexGradientBounds {
  min: Point3D;
  max: Point3D;
  center: Point3D;
  size: Point3D;
  vertexCount: number;
}

export interface SelectedVertexGradientInputs {
  selectedVertices: SelectedVertexGradientInput[];
  bounds: SelectedVertexGradientBounds | undefined;
}

export interface ApplySelectedVertexColorResult {
  modelIndex: number;
  vertexColorUpdates: VertexColorUpdate[];
}

export interface ModelDataPatchTextureUpdate {
  textureIndex: number;
  bufferKeys: TextureImageBufferKeys;
}

export interface LoadModelDataPatchResult {
  vertexColorUpdates: ApplySelectedVertexColorResult[];
  textureUpdates: ModelDataPatchTextureUpdate[];
}

export interface ApplySelectedVertexHslPayload {
  baseVertexColors: VertexColorUpdate[];
  hsl: HslValues;
}

export interface ApplySelectedVertexGradientPayload {
  startColor: NLColor;
  endColor: NLColor;
  angle: number;
  tilt: number;
  pivotPoint: number;
}

export interface ModelDataPatchTarget {
  game: ResourceAttribs['game'];
  resourceType: ResourceAttribs['resourceType'];
  identifier: string;
  polygonMapped: boolean;
  textureMapped: boolean;
}

export type ModelDataPatchVertexColorTuple = [
  modelIndex: number,
  meshIndex: number,
  polygonIndex: number,
  vertexIndex: number,
  color: NLColorRGBA
];

export interface ModelDataPatchVertexColorEntry {
  type: 'v-color';
  entry: ModelDataPatchVertexColorTuple;
}

export type ModelDataPatchEntry = ModelDataPatchVertexColorEntry;

export interface ModelDataPatchTexture {
  textureIndex: number;
  imagePath: string;
  width: number;
  height: number;
}

export interface ModelDataPatchManifest {
  formatVersion: 2;
  resourcePrefix: string;
  target: ModelDataPatchTarget;
  content: {
    vertexColors: boolean;
    textures: boolean;
  };
  entries: ModelDataPatchEntry[];
  textures: ModelDataPatchTexture[];
}

export interface ModelDataState {
  models: NLModel[];
  originalModels: NLModel[];
  textureDefs: NLUITextureDef[];
  resourceAttribs: ResourceAttribs | undefined;
  /**
   * dictionary of texture index to previous buffer url stacks
   * note: should consider having only this stack and not deriving from
   * textureDefs to simplify state
   */
  textureHistory: {
    [textureIndex: number]: {
      bufferKeys: NLUITextureDef['bufferKeys'];
    }[];
  };
  editedTextures: {
    [textureIndex: number]: EditedTexture;
  };
  textureHslSessions: {
    [textureIndex: number]: TextureHslSession;
  };
  polygonFileName?: string;
  textureFileName?: string;
  textureFileType?: TextureFileType;
  hasEditedTextures: boolean;
  isLzssCompressed: boolean;
  textureBufferKey?: string;
  polygonBufferKey?: string;
  loadTexturesState: AsyncState;
  exportTextureFileState: AsyncState;
}
