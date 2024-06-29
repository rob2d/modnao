import Head from 'next/head';
import MainView from '@/components/MainView';
import { CssBaseline } from '@mui/material';

export default function Home() {
  return (
    <>
      <Head>
        <title>ModNao</title>
        <meta
          name='description'
          content='SEGA Dreamcast ROM Model Viewer/Texture Editor for Marvel vs Capcom 2 and Capcom vs SNK 2 (and more WIP); Interactively explore, edit and export textures directly to a ROM file (or just images to download quickly) in a user friendly and accessible fashion on a ROM directly in your web browser.'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <MainView />
      <CssBaseline />
    </>
  );
}
