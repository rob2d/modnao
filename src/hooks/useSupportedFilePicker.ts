import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadPolygonFile,
  loadTextureFile,
  useAppDispatch,
  useAppSelector
} from '@/store';

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
    if (!plainFiles[0]) {
      return;
    }

    let selectedPolygonFile: File | undefined = undefined;
    let selectedTextureFile: File | undefined = undefined;

    plainFiles.forEach((f) => {
      if (f.name.match(/^(STG|DM)[0-9A-Z]{2}POL\.BIN$/)) {
        if (!selectedPolygonFile) {
          selectedPolygonFile = f;
        } else {
          onError('Cannot select more than one polygon file at this time');
          return;
        }
      }

      if (f.name.match(/^(STG|DM)[0-9A-Z]{2}TEX(.modnao)?\.BIN$/)) {
        if (!selectedTextureFile) {
          selectedTextureFile = f;
        } else {
          onError('Cannot select more than one texture file at this time');
          return;
        }
      }
    });

    if (!selectedPolygonFile && !selectedTextureFile) {
      onError(
        'Invalid stage file selected; Please select a file in the form STG**TEX.BIN or STG**POL.BIN'
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
