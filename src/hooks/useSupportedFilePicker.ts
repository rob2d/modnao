import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadCharacterPortraitsFile,
  loadMvc2CharacterWinFile,
  loadMvc2EndFile,
  loadMvc2StagePreviewsFile,
  loadPolygonFile,
  loadTextureFile,
  useAppDispatch,
  useAppSelector
} from '@/store';
import textureFileTypeMap, {
  TextureFileType
} from '@/utils/textures/files/textureFileTypeMap';

/** polygon files which may be associated to textures */
export const POLYGON_FILE_REGEX = /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)POL\.BIN$/i;

const dedicatedTextureKVs = Object.entries(textureFileTypeMap).filter(
  ([k]) => k !== 'polygon-mapped'
) as [TextureFileType, RegExp][];

export const handleFileInput = async (
  files: File[],
  onError: (error: string) => void,
  dispatch: ReturnType<typeof useAppDispatch>,
  polygonFilename: string | undefined
) => {
  const handleError = (error: string) => {
    onError(error);
    throw new Error(error);
  };
  if (!files[0]) {
    return;
  }

  let textureFileType: TextureFileType | undefined;

  let selectedPolygonFile: File | undefined = undefined;
  let selectedTextureFile: File | undefined = undefined;

  const DEDICATED_TEXTURE_FILE_ERROR =
    'Cannot select files along with dedicated texture files at this time';

  files.forEach((f, i) => {
    if (textureFileType && textureFileType !== 'polygon-mapped') {
      handleError(DEDICATED_TEXTURE_FILE_ERROR);
      return;
    }

    for (const [type, regex] of dedicatedTextureKVs) {
      if (f.name.match(regex)) {
        if (i > 0) {
          handleError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        selectedTextureFile = f;
        textureFileType = type as TextureFileType;
        return;
      }
    }

    if (f.name.match(POLYGON_FILE_REGEX)) {
      if (!selectedPolygonFile) {
        selectedPolygonFile = f;
      } else {
        handleError('Cannot select more than one polygon file at a time');
        return;
      }
    }

    if (f.name.match(textureFileTypeMap['polygon-mapped'])) {
      if (!selectedTextureFile) {
        selectedTextureFile = f;
        textureFileType = 'polygon-mapped';
      } else {
        handleError('Cannot select more than one texture file');
        return;
      }
    }
  });

  if (!selectedPolygonFile && !selectedTextureFile) {
    handleError(
      'Invalid file selected; Please select a file of either STG**POL.BIN ' +
        'along with STG**TEX.BIN, or either PL**_FAC.BIN, PL**_WIN.BIN, or SELSTG.BIN'
    );
    return;
  }

  if (selectedPolygonFile) {
    await dispatch(loadPolygonFile(selectedPolygonFile));
  }

  if (selectedTextureFile && textureFileType === 'polygon-mapped') {
    if (polygonFilename || selectedPolygonFile) {
      dispatch(loadTextureFile({ file: selectedTextureFile, textureFileType }));
    } else {
      handleError(
        'For this type of texture file, you must load a polygon ' +
          'file along with this one. You can hold control in most file selectors to select most files'
      );
      return;
    }
  }

  if (!selectedTextureFile) {
    return;
  }

  switch (textureFileType) {
    case 'mvc2-character-portraits': {
      dispatch(loadCharacterPortraitsFile(selectedTextureFile));
      break;
    }
    case 'mvc2-character-win': {
      dispatch(loadMvc2CharacterWinFile(selectedTextureFile));
      break;
    }
    case 'mvc2-stage-preview': {
      dispatch(loadMvc2StagePreviewsFile(selectedTextureFile));
      break;
    }
    case 'mvc2-end-file': {
      dispatch(loadMvc2EndFile(selectedTextureFile));
      break;
    }
    default: {
      return;
    }
  }
};

/**
 * handle a user selection of a file client-side
 * in order to dispatch action to stream that data
 * into state
 *
 * @returns open-filepicker callback
 */
export default function useSupportedFilePicker(
  onError: (error: string) => void
) {
  const polygonFilename = useAppSelector((s) => s.modelData.polygonFileName);
  const dispatch = useAppDispatch();
  const [openFileSelector, { plainFiles }] = useFilePicker({
    multiple: true,
    readAs: 'ArrayBuffer',
    accept: ['.BIN'],
    readFilesContent: false
  });

  useEffect(() => {
    handleFileInput(plainFiles, onError, dispatch, polygonFilename);
  }, [plainFiles]);

  return openFileSelector;
}
