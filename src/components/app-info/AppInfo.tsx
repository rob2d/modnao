import { styled } from '@mui/material';
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
      grid-template-columns: 4fr 7fr 4fr;
      gap: ${theme.spacing(2)};
    }

    ${theme.breakpoints.down('md')} {
      & {
        grid-template-columns: 1fr;
      }
    }

    & > * {
      overflow-y: auto;
    }

    & .app-info-section:not(:last-child) {
      margin-bottom: ${theme.spacing(3)};
    }

    .updates-and-projects {
      max-height: 100%;
    }

    
    ${theme.breakpoints.up('md')} {
      & .updates-and-projects > * {
        max-height: 50%;
        overflow-y: auto;
      }

      & .updates-and-projects {
        overflow-y: hidden;
      }
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
