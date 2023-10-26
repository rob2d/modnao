import { useAppDispatch } from '@/store';
import { selectReplacementTexture } from '@/store/replaceTextureSlice';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function useTextureReplaceDropzone(textureIndex: number) {
  const dispatch = useAppDispatch();
  const onSelectNewImageFile = useCallback(
    async (imageFile: File) => {
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
      'image/gif': ['.gif']
    }
  });

  return { getDragProps, isDragActive, onDrop, onSelectNewImageFile };
}
