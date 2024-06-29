import 'jimp';
import {
  revertTextureImage,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { SourceTextureData } from '@/utils/textures';
import {
  mdiCropFree,
  mdiFileDownload,
  mdiFileReplace,
  mdiFileUndo
} from '@mdi/js';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { useEffect, useMemo, useState } from 'react';
import { useFilePicker } from 'use-file-picker';
import createImgFromTextureDef from '@/utils/textures/files/createB64ImgFromTextureDefs';
import saveAs from 'file-saver';

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
  pixelsObjectUrls: SourceTextureData,
  onReplaceImageFile: (file: File) => void,
  handleClose: () => void,
  disableFunctionality = false,
  onSelectOption?: () => void
) {
  const dispatch = useAppDispatch();
  const openFileSelector = useTextureReplacementPicker(onReplaceImageFile);
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
          const dataUrl =
            textureDefs?.[textureIndex].dataUrls?.translucent || '';
          const fetchResult = await fetch(dataUrl);
          const arrayBuffer = await fetchResult.arrayBuffer();
          const file = new File([arrayBuffer], 'workingfile.png');

          onReplaceImageFile(file);
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
          const dataUrlImg = await createImgFromTextureDef({
            textureDef,
            asTranslucent: dlAsTranslucent
          });

          saveAs(dataUrlImg, `modnao-texture-${textureIndex}.png`);
          onSelectOption?.();
          handleClose();
        }
      }
    ],
    [
      pixelsObjectUrls,
      dlAsTranslucent,
      textureIndex,
      textureHistory,
      openFileSelector,
      onSelectOption
    ]
  );

  return options;
}
