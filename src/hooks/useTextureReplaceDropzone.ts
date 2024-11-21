import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { selectReplacementTexture, useAppDispatch } from '@/store';

export default function useTextureReplaceDropzone(textureIndex: number) {
  const dispatch = useAppDispatch();
  const onSelectNewImageFile = useCallback(
    async (imageFile: File) =>
      dispatch(selectReplacementTexture({ imageFile, textureIndex })),
    [textureIndex]
  );

  const onDrop = useCallback(
    async ([imageFile]: File[]) => onSelectNewImageFile(imageFile),
    [onSelectNewImageFile, textureIndex]
  );

  const { getRootProps: getDragProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      'image/bmp': ['.bmp'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/tiff': ['.tif', '.tiff'],
      'image/webp': ['.webp'],
      'image/tga': ['.tga']
    }
  });

  return {
    getDragProps,
    isDragActive,
    onDrop,
    onSelectNewImageFile
  };
}
