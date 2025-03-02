import { AsyncState } from '@/types/AsyncState';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import { SourceTextureData } from '@/utils/textures';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';
import HslValues from '@/utils/textures/HslValues';

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
  result: AdjustTextureHslPayload;
};

export type EditedTexture = {
  width: number;
  height: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
  hsl: HslValues;
};

export interface LoadTexturesBasePayload {
  isLzssCompressed: boolean;
  textureFileType: TextureFileType;
  textureDefs: NLUITextureDef[];
  fileName: string;
  resourceAttribs?: ResourceAttribs;
}

export type LoadTexturesPayload = LoadTexturesBasePayload & {
  textureBufferUrl: string;
};

export type LoadPolygonsPayload =
  | {
      models: NLModel[];
      textureDefs: NLUITextureDef[];
      fileName: string;
      polygonBufferUrl: string;
      resourceAttribs?: ResourceAttribs;
    }
  | {
      models: [];
      textureDefs: NLUITextureDef[];
      fileName: undefined;
      polygonBufferUrl: undefined;
      resourceAttribs?: ResourceAttribs;
    };

export type AdjustTextureHslPayload = {
  textureIndex: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
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
    [key: number]: {
      dataUrls: SourceTextureData;
      bufferUrls: SourceTextureData;
    }[];
  };
  editedTextures: {
    [key: number]: EditedTexture;
  };
  polygonFileName?: string;
  textureFileName?: string;
  textureFileType?: TextureFileType;
  hasEditedTextures: boolean;
  isLzssCompressed: boolean;
  textureBufferUrl?: string;
  polygonBufferUrl?: string;
  loadTexturesState: AsyncState;
}
