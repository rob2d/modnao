import { useCallback } from 'react';
import { Box, Button, Divider } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronDoubleRight } from '@mdi/js';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';
import { closeDialog } from '@/modules/dialogs';
import { selectIsAppInfoDialogShown } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

export default function AppInfo() {
  const dispatch = useAppDispatch();

  const onClose = useCallback(() => {
    dispatch(closeDialog());
  }, []);

  const isAppInfoDialogShown = useAppSelector(selectIsAppInfoDialogShown);

  return (
    <Box
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: 'none',
        gridTemplateRows: '1fr 1fr 1fr 1fr',
        gap: 2,
        '& .ok-button': {
          position: 'absolute',
          bottom: theme.spacing(2),
          right: theme.spacing(2)
        },
        [theme.breakpoints.up('lg')]: {
          gridTemplateColumns: '5fr 7fr 5fr',
          gridTemplateRows: '1fr 1fr',
          '& .getting-started': {
            gridRowStart: 1,
            gridRowEnd: 3
          },
          '& .dev-updates': {
            gridRowStart: 1,
            gridRowEnd: 2
          },
          '& .howto-and-contributions': {
            gridRowStart: 1,
            gridRowEnd: 4
          }
        },
        '& > *': {
          overflowY: 'auto'
        },
        '& .app-info-section:not(:last-child):not(.MuiDivider-root)': {
          pb: 3
        },
        '& .howto-and-contributions .MuiDivider-root': {
          mb: 2
        },
        [theme.breakpoints.up('md')]: {
          '& .updates-and-projects > *:not(.MuiDivider-root)': {
            height: '50%',
            overflowY: 'auto'
          },
          '& .updates-and-projects': {
            overflowY: 'hidden'
          }
        }
      })}
    >
      <GettingStarted />
      <DevUpdates />
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
      <OtherProjects />
    </Box>
  );
}
