import { AsyncState } from '@/types/AsyncState';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import { HslValues, TextureImageBufferKeys, TextureFileType } from '@/utils/textures';

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
  textureBufferKey: string;
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
  textureBufferKey?: string;
  polygonBufferKey?: string;
  loadTexturesState: AsyncState;
}
