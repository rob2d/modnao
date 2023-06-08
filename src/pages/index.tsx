import Head from 'next/head';
import SceneCanvas from '@/components/scene/SceneCanvas';
import { CssBaseline, styled } from '@mui/material';
import GuiPanel from '@/components/scene/GuiPanel';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useContext } from 'react';

const Styled = styled('main')(
  () => `
  & {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100vh;
    flex-basis: 100%;
  }
`
);

export default function Home() {
  const viewOptions = useContext(ViewOptionsContext);

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
        {!viewOptions.guiPanelVisible ? undefined : <GuiPanel />}
      </Styled>
      <CssBaseline />
    </>
  );
}
