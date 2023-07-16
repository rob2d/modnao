import { styled } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';

const Styled = styled('div')(
  ({ theme }) => `
    & {
      display: inline-grid;
      grid-template-columns: 4fr 5fr 3fr;
      gap: ${theme.spacing(2)};
    }

    & > * {
      overflow-y: auto;
    }

    & .app-info-section:not(:last-child) {
      margin-bottom: ${theme.spacing(3)}
    }

    .updates-and-projects {
      max-height: 100%;
      overflow-y: hidden;
    }
    
    & .updates-and-projects > * {
      max-height: 50%;
      overflow-y: auto;
    }`
);

export default function AppInfo() {
  return (
    <Styled>
      <div>
        <GettingStarted />
        <KeyboardShortcuts />
        <SceneNavigationHints />
      </div>
      <div className='updates-and-projects'>
        <DevUpdates />
        <OtherProjects />
      </div>
      <div>
        <Contributors />
      </div>
    </Styled>
  );
}
