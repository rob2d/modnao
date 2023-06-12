import styled from '@emotion/styled';
import GuiPanel from './scene/GuiPanel';
import SceneCanvas from './scene/SceneCanvas';

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

export default function MainView() {
  return (
    <Styled>
      <SceneCanvas />
      <GuiPanel />
    </Styled>
  );
}
