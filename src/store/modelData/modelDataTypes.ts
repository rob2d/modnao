import { AsyncState } from '@/types/AsyncState';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import { HslValues, TextureImageBufferKeys } from '@/utils/textures';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';

export type LoadPolygonsResult = {
  type: 'loadPolygonFile';
  result: LoadPolygonsPayload;
};

export type LoadTexturesResult = {
  type: 'loadTextureFile';
  result: LoadTexturesPayload;
};

export type AdjustTextureHslResult = {
  type: 'adjustTextureHsl';
  result: [SharedArrayBuffer, SharedArrayBuffer];
};

export type EditedTexture = {
  width: number;
  height: number;
  bufferKeys: TextureImageBufferKeys;
  hsl: HslValues;
};

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
  textureBufferUrl: string;
  textureDefs: NLUITextureDef[];
};

export type LoadPolygonsResultPayload = {
  models: NLModel[];
  textureDefs: NLUITextureDef[];
  fileName: string;
  polygonBufferKey: string;
  resourceAttribs?: ResourceAttribs;
};

export type LoadPolygonsPayload =
  | {
      models: NLModel[];
      textureDefs: NLUITextureDef[];
      fileName: string;
      polygonBufferKey: string;
      resourceAttribs?: ResourceAttribs;
    }
  | {
      models: [];
      textureDefs: NLUITextureDef[];
      fileName: undefined;
      polygonBufferKey: undefined;
      resourceAttribs?: ResourceAttribs;
    };

export type AdjustTextureHslPayload = {
  textureIndex: number;
  bufferKeys: TextureImageBufferKeys;
  hsl: HslValues;
};

export interface ModelDataState {
  models: NLModel[];
  textureDefs: NLUITextureDef[];
  resourceAttribs: ResourceAttribs | undefined;
  /**
   * dictionary of texture index to previous buffer url stacks
   * note: should consider having only this stack and not deriving from
   * textureDefs to simplify state
   */
  textureHistory: {
    [textureIndex: number]: {
      bufferKeys: TextureImageBufferKeys;
    }[];
  };
  editedTextures: {
    [textureIndex: number]: EditedTexture;
  };
  polygonFileName?: string;
  textureFileName?: string;
  textureFileType?: TextureFileType;
  hasEditedTextures: boolean;
  isLzssCompressed: boolean;
  textureBufferUrl?: string;
  polygonBufferKey?: string;
  loadTexturesState: AsyncState;
}
