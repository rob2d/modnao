import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { useFilePicker } from 'use-file-picker';
import { useCallback, useEffect, useState } from 'react';
import { loadSampleData, loadStage, useAppDispatch } from '@/store';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export default function Home() {
  const dispatch = useAppDispatch();
  // @TODO: handle async state on UI
  const [openFileSelector, { plainFiles }] = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['.BIN'],
    readFilesContent: false
  });

  const Styled = styled('main')(
    ({ theme }) => `
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

  const [hasLoadedSampleData, setLoadedSampleData] = useState(false);

  const onLoadSampleData = useCallback(() => {
    if (!hasLoadedSampleData) {
      dispatch(loadSampleData());
      setLoadedSampleData(true);
    }
  }, [hasLoadedSampleData, dispatch]);

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
      <Styled className={styles.main}>
        <SceneCanvas />;
        <div className='buttons'>
          <Button
            onClick={onLoadSampleData}
            variant='outlined'
            disabled={hasLoadedSampleData}
          >
            Load sample model
          </Button>
          <Button onClick={openFileSelector} variant='outlined'>
            Select File
          </Button>
        </div>
      </Styled>
    </>
  );
}
