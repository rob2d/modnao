import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadCharacterPortraitsFile,
  loadCharacterWinFile,
  loadPolygonFile,
  loadTextureFile,
  useAppDispatch,
  useAppSelector
} from '@/store';

/** includes character-specific super portraits and end-game images */
export const CHARACTER_PORTRAITS_REGEX_FILE = /^PL[0-9A-Z]{2}_FAC.BIN$/i;

/** includes character-specific super portraits and end-game images */
export const CHARACTER_WIN_REGEX_FILE = /^PL[0-9A-Z]{2}_WIN.BIN$/i;

/** polygon files which may be associated to textures */
export const POLYGON_FILE_REGEX = /^(STG|DM)[0-9A-Z]{2}POL\.BIN$/i;

/** textures which must be associated with polygons */
const TEXTURE_FILE_REGEX = /^(STG|DM)[0-9A-Z]{2}TEX(.modnao)?\.BIN$/i;

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
  const hasLoadedPolygonFile = useAppSelector(
    (s) => s.modelData.polygonFileName
  );
  const dispatch = useAppDispatch();
  const [openFileSelector, { plainFiles }] = useFilePicker({
    multiple: true,
    readAs: 'ArrayBuffer',
    accept: ['.BIN'],
    readFilesContent: false
  });

  useEffect(() => {
    const handleError = (error: string) => {
      onError(error);
      throw new Error(error);
    };
    if (!plainFiles[0]) {
      return;
    }

    let selectedPolygonFile: File | undefined = undefined;
    let selectedTextureFile: File | undefined = undefined;
    let selectedCharacterPortraitsFile: File | undefined = undefined;
    let selectedCharacterWinFile: File | undefined = undefined;

    const DEDICATED_TEXTURE_FILE_ERROR =
      'Cannot select files along with dedicated texture files at this time';

    plainFiles.forEach((f, i) => {
      if (selectedCharacterPortraitsFile || selectedCharacterWinFile) {
        handleError(DEDICATED_TEXTURE_FILE_ERROR);
        return;
      }

      if (f.name.match(CHARACTER_PORTRAITS_REGEX_FILE)) {
        if (i > 0) {
          handleError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        selectedCharacterPortraitsFile = f;
        return;
      }

      if (f.name.match(CHARACTER_WIN_REGEX_FILE)) {
        if (i > 0) {
          handleError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        selectedCharacterWinFile = f;
        return;
      }

      if (f.name.match(POLYGON_FILE_REGEX)) {
        if (!selectedPolygonFile) {
          selectedPolygonFile = f;
        } else {
          onError('Cannot select more than one polygon file at a time');
          return;
        }
      }

      if (f.name.match(TEXTURE_FILE_REGEX)) {
        if (!selectedTextureFile) {
          selectedTextureFile = f;
        } else {
          onError('Cannot select more than one texture file');
          return;
        }
      }
    });

    if (
      !selectedPolygonFile &&
      !selectedTextureFile &&
      !selectedCharacterPortraitsFile &&
      !selectedCharacterWinFile
    ) {
      onError(
        'Invalid file selected; Please select a file in the form STG**POL.BIN along with STG**TEX.BIN, or PL**_FAC.BIN or PL**_WIN.BIN'
      );
      return;
    }

    (async () => {
      if (selectedPolygonFile) {
        await dispatch(loadPolygonFile(selectedPolygonFile));
      }

      if (selectedTextureFile) {
        if (hasLoadedPolygonFile || selectedPolygonFile) {
          dispatch(loadTextureFile(selectedTextureFile));
        } else {
          onError(
            'Must load a polygon file along with or before loading a texture file'
          );
          return;
        }
      }

      if (selectedCharacterPortraitsFile) {
        dispatch(loadCharacterPortraitsFile(selectedCharacterPortraitsFile));
      }

      if (selectedCharacterWinFile) {
        dispatch(loadCharacterWinFile(selectedCharacterWinFile));
      }
    })();
  }, [plainFiles]);

  return openFileSelector;
}
