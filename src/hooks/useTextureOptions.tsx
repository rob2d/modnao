import {
  revertTextureImage,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { objectUrlToBuffer } from '@/utils/data';
import { SourceTextureData } from '@/utils/textures';
import { mdiFileDownload, mdiFileReplace, mdiFileUndo } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import 'jimp';
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
  onSelectOption?: () => void
) {
  const dispatch = useAppDispatch();
  const openFileSelector = useTextureReplacementPicker(onReplaceImageFile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);

  // when menu is open, toggle translucent download
  // when hotkey is pressed
  const translucentHotkeyPressed = useKeyPress({ targetKey: 't' });
  const [dlAsTranslucent, setDlAsTranslucent] = useState(() => false);

  useEffect(() => {
    if (open && translucentHotkeyPressed) {
      setDlAsTranslucent(!dlAsTranslucent);
    }
  }, [open && translucentHotkeyPressed]);

  useEffect(() => {
    if (!open && dlAsTranslucent) {
      setDlAsTranslucent(false);
    }
  }, [dlAsTranslucent && !open]);

  const textureHistory = useAppSelector(
    (s) => s.modelData.textureHistory[textureIndex]
  );

  const options = useMemo(
    () => [
      {
        label: (
          <>
            <Icon path={mdiFileDownload} size={1} />
            Download&nbsp;{dlAsTranslucent ? '(T)' : '(O)'}
          </>
        ),
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
      },
      {
        title: 'Replace',
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
      ...(!textureHistory?.length
        ? []
        : [
            {
              title: 'Undo Image Change',
              iconPath: mdiFileUndo,
              tooltip: 'Undo a previously replaced texture operation',
              onClick() {
                if (textureHistory?.length) {
                  dispatch(revertTextureImage({ textureIndex }));
                }
                onSelectOption?.();
              }
            }
          ])
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
