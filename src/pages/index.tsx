import Head from 'next/head';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { CssBaseline, styled } from '@mui/material';
import InfoPanel from '@/components/scene/InfoPanel';

const Styled = styled('main')(
  ({ theme }) => `
  & {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
`
);

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
      <Styled>
        <SceneCanvas />
        <InfoPanel />
      </Styled>
      <CssBaseline />
    </>
  );
}
