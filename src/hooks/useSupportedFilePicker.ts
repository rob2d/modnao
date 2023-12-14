import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile,
  useAppDispatch,
  useAppSelector
} from '@/store';
import textureFileTypeMap, {
  TextureFileType
} from '@/utils/textures/files/textureFileTypeMap';

/** polygon files which may be associated to textures */
export const POLYGON_FILE = /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)POL.BIN$/i;

const dedicatedTextureKVs = Object.entries(textureFileTypeMap).filter(
  ([k]) => k !== 'polygon-mapped'
) as [TextureFileType, RegExp][];

export const handleFileInput = async (
  files: File[],
  onError: (error: string) => void,
  dispatch: ReturnType<typeof useAppDispatch>,
  polygonFilename: string | undefined
) => {
  if (!files[0]) {
    return;
  }

  let textureFileType: TextureFileType | undefined;

  let selectedPolygonFile: File | undefined = undefined;
  let selectedTextureFile: File | undefined = undefined;

  const DEDICATED_TEXTURE_FILE_ERROR =
    'Dedicated texture files can only be edited individually at this moment, they cannot be selected with others';

  files.forEach((f, i) => {
    if (textureFileType && textureFileType !== 'polygon-mapped') {
      onError(DEDICATED_TEXTURE_FILE_ERROR);
      return;
    }

    for (const [type, regex] of dedicatedTextureKVs) {
      if (f.name.match(regex)) {
        if (i > 0) {
          onError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        selectedTextureFile = f;
        textureFileType = type as TextureFileType;
        return;
      }
    }

    if (f.name.match(POLYGON_FILE)) {
      if (!selectedPolygonFile) {
        selectedPolygonFile = f;
      } else {
        onError('Cannot select more than one polygon file at a time');
        return;
      }
    }

    if (f.name.match(textureFileTypeMap['polygon-mapped'])) {
      if (!selectedTextureFile) {
        selectedTextureFile = f;
        textureFileType = 'polygon-mapped';
      } else {
        onError('Cannot select more than one texture file');
        return;
      }
    }
  });

  if (!selectedPolygonFile && !selectedTextureFile) {
    onError(
      'Invalid file selected. See "What Files Are Supported" for more info.'
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
      onError(
        'For this type of texture file, you must load a polygon file along with it. ' +
          'You can hold control in most file selectors to select most files'
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
    case 'mvc2-character-win':
    case 'mvc2-stage-preview':
    case 'mvc2-selection-textures':
    case 'mvc2-end-file': {
      dispatch(
        loadTextureFile({
          file: selectedTextureFile,
          textureFileType,
          isCompressed: true
        })
      );
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
  onError: (error: string | JSX.Element) => void
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
