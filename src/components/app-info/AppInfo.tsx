import { Button, styled } from '@mui/material';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';
import { mdiChevronDoubleRight } from '@mdi/js';
import Icon from '@mdi/react';

const Styled = styled('div')(
  ({ theme }) => `
    & {
      display: inline-grid;
      grid-template-columns: 5fr 7fr 5fr;
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
      padding-bottom: ${theme.spacing(3)};
    }

    .updates-and-projects {
      max-height: 100%;
    }

    .updates-and-projects > :nth-child(2) {
      display: flex;
      flex-direction: column;
    }   
    
    ${theme.breakpoints.up('md')} {
      & .updates-and-projects > * {
        height: 50%;
        overflow-y: auto;
      }

      & .updates-and-projects {
        overflow-y: hidden;
      }

      & .ok-button {
        position: absolute;
        bottom: ${theme.spacing(2)};
        right: ${theme.spacing(2)};
      }
    }`
);

type Props = { onCloseDialog: ((reason: string) => void) | undefined };
export default function AppInfo({ onCloseDialog }: Props) {
  return (
    <Styled>
      <div>
        <GettingStarted />
      </div>
      <div className='updates-and-projects'>
        <DevUpdates />
        <OtherProjects />
      </div>
      <div>
        <Contributors />
        <KeyboardShortcuts />
        <SceneNavigationHints />
        <Button
          variant='outlined'
          onClick={onCloseDialog as () => void}
          className='ok-button'
        >
          OK <Icon path={mdiChevronDoubleRight} size={1} />
        </Button>
      </div>
    </Styled>
  );
}
