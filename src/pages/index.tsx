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
          content='Dreamcast ROM Model Viewer/Virtual Debugger'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <MainView />
      <CssBaseline />
    </>
  );
}
