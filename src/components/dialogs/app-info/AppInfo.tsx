import { Button, Divider, styled } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronDoubleRight } from '@mdi/js';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';
import { useCallback } from 'react';
import {
  selectIsAppInfoDialogShown,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { closeDialog } from '@/store/dialogsSlice';

const Styled = styled('div')(
  ({ theme }) => `
    & {
      display: inline-grid;
      grid-template-columns: 5fr 7fr 5fr;
      gap: ${theme.spacing(2)};
    }

    & .ok-button {
      position: absolute;
      bottom: ${theme.spacing(2)};
      right: ${theme.spacing(2)};
    }

    ${theme.breakpoints.down('lg')} {
      & {
        grid-template-columns: none;
        grid-template-rows: 3fr 2fr 3fr;
      }
    }

    & > * {
      overflow-y: auto;
    }

    & .app-info-section:not(:last-child):not(.MuiDivider-root) {
      padding-bottom: ${theme.spacing(3)};
    }

    .updates-and-projects {
      max-height: 100%;
    }

    .updates-and-projects > :nth-of-type(3) {
      display: flex;
      flex-direction: column;
    }

    .howto-and-contributions .MuiDivider-root {
      margin-bottom: ${theme.spacing(2)};
    }
    
    ${theme.breakpoints.up('md')} {
      & .updates-and-projects > *:not(.MuiDivider-root) {
        height: 50%;
        overflow-y: auto;
      }

      & .updates-and-projects {
        overflow-y: hidden;
      }
    }`
);

export default function AppInfo() {
  const dispatch = useAppDispatch();

  const onClose = useCallback(() => {
    dispatch(closeDialog());
  }, []);

  const isAppInfoDialogShown = useAppSelector(selectIsAppInfoDialogShown);

  return (
    <Styled>
      <GettingStarted />
      <div className='updates-and-projects'>
        <DevUpdates />
        <Divider flexItem />
        <OtherProjects />
      </div>
      <div className='howto-and-contributions'>
        <KeyboardShortcuts />
        <Divider />
        <SceneNavigationHints />
        <Divider />
        <Contributors />
        {!isAppInfoDialogShown ? undefined : (
          <Button
            variant='outlined'
            className='ok-button'
            onClick={onClose as () => void}
          >
            OK <Icon path={mdiChevronDoubleRight} size={1} />
          </Button>
        )}
      </div>
    </Styled>
  );
}
