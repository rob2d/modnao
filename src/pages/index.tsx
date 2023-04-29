import Head from 'next/head';
import Typography from '@mui/material/Typography';
import styles from '@/styles/Home.module.css';
import SceneCanvas from '@/components/scene/SceneCanvas';

export default function Home() {
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
        <SceneCanvas />;
      </main>
    </>
  );
}
