import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadPolygonFile,
  loadTextureFile,
  useAppDispatch,
  useAppSelector
} from '@/store';

/** includes character-specific super portraits and win poses */
const DEDICATED_TEXTURE_FILE_REGEX = /^PL[0-9A-Z]{2}_(FAC|WIN).BIN$/i;

/** polygon files which may be associated to textures */
const POLYGON_FILE_REGEX = /^(STG|DM)[0-9A-Z]{2}POL\.BIN$/i;

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
    let dedicatedTextureFile: File | undefined = undefined;

    const DEDICATED_TEXTURE_FILE_ERROR =
      'Cannot select other files with dedicated texture files at this time';

    plainFiles.forEach((f, i) => {
      if (dedicatedTextureFile) {
        handleError(DEDICATED_TEXTURE_FILE_ERROR);
        return;
      }

      if (f.name.match(DEDICATED_TEXTURE_FILE_REGEX)) {
        if (i > 0) {
          handleError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        dedicatedTextureFile = f;
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

    if (!selectedPolygonFile && !selectedTextureFile && !dedicatedTextureFile) {
      onError(
        'Invalid stage file selected; Please select a file in the form STG**POL.BIN along with STG**TEX.BIN, or PL**_FAC.BIN or PL**_WIN.BIN'
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
    })();
  }, [plainFiles]);

  return openFileSelector;
}
