import 'jimp';
import {
  revertTextureImage,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { objectUrlToBuffer } from '@/utils/data';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { Jimp } = globalThis as any;

function useTextureReplacementPicker(onReplaceImageFile: (file: File) => void) {
  const [
    openFileSelector,
    {
      plainFiles: [file]
    }
  ] = useFilePicker({
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

  return openFileSelector;
}

export default function useTextureOptions(
  textureIndex: number,
  pixelsObjectUrls: SourceTextureData,
  onReplaceImageFile: (file: File) => void,
  disableFunctionality?: boolean,
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
        onClick() {
          window.alert('not yet implemented');
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
        }
      },
      {
        label: `Download ${dlAsTranslucent ? '(T)' : '(O)'}`,
        iconPath: mdiFileDownload,
        tooltip: `Download texture as a PNG [${
          dlAsTranslucent ? 'translucent' : 'opaque'
        }]. Press 'T' key to toggle translucency.`,
        onClick: async () => {
          const bufferUrl =
            (!dlAsTranslucent
              ? pixelsObjectUrls.opaque || pixelsObjectUrls.translucent
              : pixelsObjectUrls.translucent) || '';
          const a = document.createElement('a');

          const pixels = new Uint8ClampedArray(
            await objectUrlToBuffer(bufferUrl)
          );
          new Jimp.read(
            {
              data: pixels,
              width: textureDefs[textureIndex].width,
              height: textureDefs[textureIndex].height
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (_: Error, image: typeof Jimp) => {
              image.getBase64Async(Jimp.MIME_PNG).then((base64: string) => {
                a.download = `modnao-texture-${textureIndex}.png`;
                a.href = base64;
                a.click();
                onSelectOption?.();
              });
            }
          );
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
