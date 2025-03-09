export type ReplacementImage = {
  bufferKey: string;
  width: number;
  height: number;
};

export interface ReplaceTextureState {
  textureIndex: number;
  replacementImage?: ReplacementImage;
}
