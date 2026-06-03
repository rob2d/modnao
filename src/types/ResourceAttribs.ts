import type TextureFileType from './TextureFileType';
import { NLUITextureDef } from './NLAbstractions';

type ResourceType =
  | 'mvc2-stage'
  | 'cvs1-stage'
  | 'cvs1-demo'
  | 'cvs1-menu'
  | 'cvs2-stage'
  | 'cvs2-menu'
  | 'mvc2-menu'
  | 'vs2-stage'
  | 'vs2-demo';

/**
 * information pertaining to the file resource
 * and important attributes to define it
 */
export type ResourceAttribs = {
  game: 'MVC2' | 'CVS2' | 'CVS1Pro' | 'VS2';
  name: string;
  identifier: string;
  resourceType: ResourceType;
  filenamePattern: string;
  oobReferencable: boolean;
  textureFileType?: TextureFileType;
  textureDefsHash?: string;
  hasLzssTextureFile: boolean;
  textureShapesMap?: NLUITextureDef[];
} & (NonPolygonMapping | PolygonMapping);

export type ModelHint = {
  name: string;
  description?: string;
  keywords?: string[] | ReadonlyArray<string>;
};

export type PolygonMapping = {
  polygonMapped: true;
  modelHints?: Record<string, ModelHint>;
};

export type NonPolygonMapping = {
  polygonMapped: false;
};
