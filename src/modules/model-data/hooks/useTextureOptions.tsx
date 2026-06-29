import CropFreeIcon from '@mui/icons-material/CropFree';
import DownloadIcon from '@mui/icons-material/Download';
import UndoIcon from '@mui/icons-material/Undo';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { revertTextureImage } from '../modelDataSlice';
import { selectTextureFileName, selectUpdatedTextureDefs } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import {
  createB64ImgFromTextureDef,
  TextureImageBufferKeys
} from '@/utils/textures';
import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useFilePicker } from 'use-file-picker';
import saveAs from 'file-saver';
import globalBuffers from '@/utils/data/globalBuffers';
import { useKeyPressEffect } from '@/hooks';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

interface TextureOption {
  label: string;
  icon: ReactNode;
  tooltip: string;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

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
  ignoreKeyboardFunctions = false,
  onSelectOption?: () => void
) {
  const dispatch = useAppDispatch();
  const { textureViewMode } = useContext(SceneOptionsContext);
  const openFileSelector = useTextureReplacementPicker(onReplaceImageFile);
  const textureFileName = useAppSelector(selectTextureFileName);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const textureViewModeRef = useRef(textureViewMode);

  // when menu is open, toggle translucent download as hotkey is pressed
  const [wantsTranslucentDownload, setWantsTranslucentDownload] = useState(
    () => textureViewMode === 'transparent'
  );

  useEffect(() => {
    textureViewModeRef.current = textureViewMode;
  }, [textureViewMode]);

  useEffect(() => {
    if (ignoreKeyboardFunctions) {
      return;
    }

    setWantsTranslucentDownload(textureViewModeRef.current === 'transparent');
  }, [ignoreKeyboardFunctions]);

  useKeyPressEffect(
    't',
    () => {
      setWantsTranslucentDownload((prev) => !prev);
    },
    { disabled: ignoreKeyboardFunctions }
  );

  const dlAsTranslucent = !ignoreKeyboardFunctions && wantsTranslucentDownload;

  const textureHistory = useAppSelector(
    (s) => s.modelData.textureHistory[textureIndex]
  );

  const options = useMemo(
    (): TextureOption[] => [
      {
        label: 'Undo source change',
        icon: <UndoIcon fontSize='small' />,
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
        label: 'Crop/rotate',
        icon: <CropFreeIcon fontSize='small' />,
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
        icon: <UploadFileIcon fontSize='small' />,
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
        icon: <DownloadIcon fontSize='small' />,
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
      wantsTranslucentDownload,
      textureIndex,
      textureHistory,
      openFileSelector,
      onSelectOption
    ]
  );

  return options;
}
