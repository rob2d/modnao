import Head from 'next/head';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { loadStagePolygonFile, useAppDispatch, selectModel } from '@/store';
import { Fab, Tooltip, styled } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { useSelector } from 'react-redux';
import DebugInfoPanel from '@/components/scene/DebugInfoPanel';
import { useModelSelectionExport } from '@/hooks';
import useUserStageFileLoader from '@/hooks/useStageFilePicker';

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
  const model = useSelector(selectModel);
  const openFileSelector = useUserStageFileLoader();
  const onExportSelection = useModelSelectionExport();

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
        <DebugInfoPanel />
        <div className='buttons'>
          {!model ? undefined : (
            <Tooltip title='Export ModNao model .json data'>
              <Fab onClick={onExportSelection} color='secondary'>
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
