import { useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import { loadStage, useAppDispatch } from '@/store';

/**
 * handle a user selection of a file client-side
 * in order to dispatch action to stream that data
 * into state
 *
 * @returns open-filepicker callback
 */
export default function useUserStageFileLoader() {
  const dispatch = useAppDispatch();
  const [openFileSelector, { plainFiles }] = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['.BIN'],
    readFilesContent: false
  });

  useEffect(() => {
    if (!plainFiles[0]) {
      return;
    }
    const [stageFile] = plainFiles;
    dispatch(loadStage(stageFile));
  }, [plainFiles?.[0]]);

  return openFileSelector;
}
