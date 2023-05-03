import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { useFilePicker } from 'use-file-picker';
import { useCallback, useEffect } from 'react';
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

  const Styled = styled('main')`
    & .buttons {
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
    }
  `;

  const onLoadSampleData = useCallback(() => {
    dispatch(loadSampleData());
  }, [dispatch]);

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
        <div className='buttons'>
          <Button onClick={openFileSelector} variant='outlined'>
            Select File
          </Button>
          <Button onClick={onLoadSampleData} variant='outlined'>
            Load sample model
          </Button>
        </div>
        <SceneCanvas />;
      </Styled>
    </>
  );
}
