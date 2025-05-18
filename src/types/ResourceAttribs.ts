import { ResourceType } from './ResourceType';
import { NLUITextureDef } from './NLAbstractions';

/**
 * information pertaining to the file resource
 * and important attributes to define it
 */
export type ResourceAttribs = {
  game: 'MVC2' | 'CVS2' | 'CVS1Pro';
  /** name e.g. "MVC2 Carnival Stage" */
  name: string;
  /** possible visual way to id a resource, e.g. hex id like 0x12 */
  identifier: string;
  /** describes the type of resource e.g. "MVC2 stage file" */
  resourceType: ResourceType;
  /** patterns that are accepted to identify this file */
  filenamePattern: string;

  hasLzssTextureFile: boolean;

  textureShapesMap?: NLUITextureDef[];
};
