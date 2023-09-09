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

export type TEXTURE_FILE_TYPE =
  | 'mvc2-stage-preview'
  | 'character-portraits'
  | 'mvc2-character-win'
  | 'polygon-mapped'
  | 'mvc2-end-file';

/** includes character-specific super portraits and end-game images */
export const CHARACTER_PORTRAITS_REGEX_FILE = /^PL[0-9A-Z]{2}_FAC.BIN$/i;

/** includes character-specific super portraits and end-game images */
export const MVC2_CHARACTER_WIN_REGEX_FILE = /^PL[0-9A-Z]{2}_WIN.BIN$/i;

/** polygon files which may be associated to textures */
export const POLYGON_FILE_REGEX = /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)POL\.BIN$/i;

/** textures which must be associated with polygons */
export const TEXTURE_FILE_REGEX =
  /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)TEX(.modnao)?\.BIN$/i;

/** textures associated with stage selection previews */
export const MVC2_STAGE_PREVIEWS_FILE_REGEX = /^SELSTG\.BIN$/i;

export const MVC2_END_FILE_REGEX = /^END(DC|NM)TEX\.BIN$/i;

const typeRegexMappings: [TEXTURE_FILE_TYPE, RegExp][] = [
  ['character-portraits', CHARACTER_PORTRAITS_REGEX_FILE],
  ['mvc2-character-win', MVC2_CHARACTER_WIN_REGEX_FILE],
  ['mvc2-stage-preview', MVC2_STAGE_PREVIEWS_FILE_REGEX],
  ['mvc2-end-file', MVC2_END_FILE_REGEX]
];

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

    let textureType: TEXTURE_FILE_TYPE | undefined;

    let selectedPolygonFile: File | undefined = undefined;
    let selectedTextureFile: File | undefined = undefined;

    const DEDICATED_TEXTURE_FILE_ERROR =
      'Cannot select files along with dedicated texture files at this time';

    plainFiles.forEach((f, i) => {
      if (textureType && textureType !== 'polygon-mapped') {
        handleError(DEDICATED_TEXTURE_FILE_ERROR);
        return;
      }

      for (const [type, regex] of typeRegexMappings) {
        if (f.name.match(regex)) {
          if (i > 0) {
            handleError(DEDICATED_TEXTURE_FILE_ERROR);
            return;
          }

          selectedTextureFile = f;
          textureType = type;
          return;
        }
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
          textureType = 'polygon-mapped';
        } else {
          onError('Cannot select more than one texture file');
          return;
        }
      }
    });

    if (!selectedPolygonFile && !selectedTextureFile) {
      onError(
        'Invalid file selected; Please select a file of either STG**POL.BIN ' +
          'along with STG**TEX.BIN, or either PL**_FAC.BIN, PL**_WIN.BIN, or SELSTG.BIN'
      );
      return;
    }

    (async () => {
      if (selectedPolygonFile) {
        await dispatch(loadPolygonFile(selectedPolygonFile));
      }

      if (selectedTextureFile && textureType === 'polygon-mapped') {
        if (hasLoadedPolygonFile || selectedPolygonFile) {
          dispatch(loadTextureFile(selectedTextureFile));
        } else {
          onError(
            'For this type of texture file, you must load a polygon ' +
              'file along with this one. You can hold control in most file selectors to select most files'
          );
          return;
        }
      }

      if (!selectedTextureFile) {
        return;
      }

      switch (textureType) {
        case 'character-portraits': {
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
    })();
  }, [plainFiles]);

  return openFileSelector;
}
