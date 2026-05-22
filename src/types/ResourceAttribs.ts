import { ResourceType } from './ResourceType';
import { NLUITextureDef } from './NLAbstractions';

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
  polygonMapped: boolean;
  oobReferencable: boolean;
  textureDefsHash?: string;
  hasLzssTextureFile: boolean;
  allowFileNameOnlyMatch?: boolean;
  textureShapesMap?: NLUITextureDef[];
};
