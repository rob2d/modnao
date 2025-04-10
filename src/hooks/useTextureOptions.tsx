import 'jimp';
import {
  revertTextureImage,
  selectTextureFileName,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import {
  createB64ImgFromTextureDef,
  TextureImageBufferKeys
} from '@/utils/textures';
import {
  mdiCropFree,
  mdiFileDownload,
  mdiFileReplace,
  mdiFileUndo
} from '@mdi/js';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { useEffect, useMemo, useState } from 'react';
import { useFilePicker } from 'use-file-picker';
import saveAs from 'file-saver';
import globalBuffers from '@/utils/data/globalBuffers';

function useTextureReplacementPicker(onReplaceImageFile: (file: File) => void) {
  const {
    plainFiles: [file],
    openFilePicker
  } = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['image/*']
  });

  useEffect(() => {
    if (!file) {
      return;
    }

    onReplaceImageFile(file);
  }, [file]);

  return openFilePicker;
}

export default function useTextureOptions(
  textureIndex: number,
  pixelBufferKeys: TextureImageBufferKeys,
  onReplaceImageFile: (file: File | SharedArrayBuffer) => void,
  handleClose: () => void,
  disableFunctionality = false,
  onSelectOption?: () => void
) {
  const dispatch = useAppDispatch();
  const openFileSelector = useTextureReplacementPicker(onReplaceImageFile);
  const textureFileName = useAppSelector(selectTextureFileName);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);

  // when menu is open, toggle translucent download
  // when hotkey is pressed
  const translucentHotkeyPressed = useKeyPress({ targetKey: 't' });
  const [dlAsTranslucent, setDlAsTranslucent] = useState(() => false);

  useEffect(() => {
    if (!disableFunctionality && translucentHotkeyPressed) {
      setDlAsTranslucent(!dlAsTranslucent);
    }
  }, [!disableFunctionality && translucentHotkeyPressed]);

  useEffect(() => {
    if (disableFunctionality && dlAsTranslucent) {
      setDlAsTranslucent(false);
    }
  }, [dlAsTranslucent && disableFunctionality]);

  const textureHistory = useAppSelector(
    (s) => s.modelData.textureHistory[textureIndex]
  );

  const options = useMemo(
    () => [
      {
        label: 'Undo Change',
        iconPath: mdiFileUndo,
        tooltip:
          'Undo a previous replace-texture or crop/resize operation; does not include color changes',
        disabled: !textureHistory?.length,
        onClick() {
          if (textureHistory?.length) {
            dispatch(revertTextureImage({ textureIndex }));
          }
          onSelectOption?.();
        }
      },
      {
        label: 'Crop/Rotate',
        iconPath: mdiCropFree,
        tooltip:
          'Open image replace dialog with existing image to crop/rotate in-place',
        async onClick() {
          const bufferKey =
            textureDefs?.[textureIndex].bufferKeys?.translucent || '';
          const buffer = globalBuffers.getShared(bufferKey);

          onReplaceImageFile(buffer);
          handleClose();
        }
      },
      {
        label: 'Replace',
        iconPath: mdiFileReplace,
        tooltip:
          'Replace this texture with another image file.' +
          'Special zero-alpha pixels will be auto re-applied ' +
          'once you have imported the image and zoomed/cropped/rotated it.',
        onClick() {
          openFileSelector();
          onSelectOption?.();
          handleClose();
        }
      },
      {
        label: `Download ${dlAsTranslucent ? '(T)' : '(O)'}`,
        iconPath: mdiFileDownload,
        tooltip: `Download texture as a PNG [${
          dlAsTranslucent ? 'translucent' : 'opaque'
        }]. Press 'T' key to toggle translucency.`,
        onClick: async () => {
          const textureDef = textureDefs[textureIndex];
          const dataUrlImg = await createB64ImgFromTextureDef({
            textureDef,
            asTranslucent: dlAsTranslucent
          });

          saveAs(
            dataUrlImg,
            `${textureFileName?.replace(/.([a-zA-Z0-9]+)$/, '')}.mn.${textureIndex}.png`
          );
          onSelectOption?.();
          handleClose();
        }
      }
    ],
    [
      pixelBufferKeys,
      dlAsTranslucent,
      textureIndex,
      textureHistory,
      openFileSelector,
      onSelectOption
    ]
  );

  return options;
}
