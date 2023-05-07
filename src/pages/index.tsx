import { useCallback, useEffect } from 'react';
import exportFromJSON from 'export-from-json';
import Head from 'next/head';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { useFilePicker } from 'use-file-picker';
import {
  loadStage,
  useAppDispatch,
  selectModel,
  selectModelIndex
} from '@/store';
import { Fab, Tooltip, styled } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { useSelector } from 'react-redux';

const Styled = styled('main')(
  ({ theme }) => `
  & {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
  & .buttons {
    position: fixed;
    bottom: ${theme.spacing(2)};
    right: ${theme.spacing(2)};
    display: flex;
  }

  & .buttons > :first-child {
    right: ${theme.spacing(2)}
  }
`
);

export default function Home() {
  const dispatch = useAppDispatch();
  // @TODO: handle async state on UI
  const [openFileSelector, { plainFiles }] = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['.BIN'],
    readFilesContent: false
  });

  const model = useSelector(selectModel);
  const modelIndex = useSelector(selectModelIndex);

  const onDownloadModel = useCallback(() => {
    exportFromJSON({
      data: model,
      fileName: `modnao-model-${modelIndex}.json`,
      exportType: exportFromJSON.types.json
    });
  }, [model]);

  useEffect(() => {
    if (!plainFiles[0]) {
      return;
    }
    const [stageFile] = plainFiles;
    dispatch(loadStage(stageFile));
  }, [plainFiles?.[0]]);

  return (
    <>
      <Head>
        <title>ModNao</title>
        <meta
          name='description'
          content='Dreamcast ROM Model Viewer/Virtual Debugger'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Styled>
        <SceneCanvas />
        <div className='buttons'>
          {!model ? undefined : (
            <Tooltip title='Export ModNao model .json data'>
              <Fab onClick={onDownloadModel} color='secondary'>
                <DownloadForOfflineIcon />
              </Fab>
            </Tooltip>
          )}
          <Tooltip title='Select an MVC2 or CVS2 STGXY.POL file'>
            <Fab onClick={openFileSelector} color='primary'>
              <FileUploadIcon />
            </Fab>
          </Tooltip>
        </div>
      </Styled>
    </>
  );
}
