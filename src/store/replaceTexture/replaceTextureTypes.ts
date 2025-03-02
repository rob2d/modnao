export type ReplacementImage = {
  bufferObjectUrl: string;
  width: number;
  height: number;
};

export interface ReplaceTextureState {
  textureIndex: number;
  replacementImage?: ReplacementImage;
}
