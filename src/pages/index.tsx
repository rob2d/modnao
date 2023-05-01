import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { useFilePicker } from 'use-file-picker';
import { useEffect } from 'react';
import { processStageFile, useAppDispatch } from '@/store';

export default function Home() {
  const dispatch = useAppDispatch();
  // @TODO: handle async state on UI
  const [openFileSelector, { loading, errors, plainFiles, clear }] =
    useFilePicker({
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
    dispatch(processStageFile(stageFile));
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
      <main className={styles.main}>
        <button onClick={openFileSelector}>Select file</button>
        <SceneCanvas />;
      </main>
    </>
  );
}
