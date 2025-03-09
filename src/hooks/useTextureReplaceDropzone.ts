import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { selectReplacementTexture, useAppDispatch } from '@/store';

export default function useTextureReplaceDropzone(textureIndex: number) {
  const dispatch = useAppDispatch();
  const onSelectNewImageFile = useCallback(
    async (imageFile: File | SharedArrayBuffer) => {
      dispatch(selectReplacementTexture({ imageFile, textureIndex }));
    },
    [textureIndex]
  );

  const onDrop = useCallback(
    async ([file]: File[]) => {
      onSelectNewImageFile(file);
    },
    [onSelectNewImageFile]
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
      'image/webp': ['.webp']
    }
  });

  return { getDragProps, isDragActive, onDrop, onSelectNewImageFile };
}
