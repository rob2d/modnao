import { useCallback } from 'react';
import { Box, Button, Divider } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronDoubleRight } from '@mdi/js';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevVlog from './sections/DevVlog';
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
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'none', lg: '5fr 7fr 5fr' },
        gridTemplateRows: { xs: '1fr 1fr 1fr 1fr', lg: '1fr 1fr' },
        gap: 1,
        '& .ok-button': {
          position: 'absolute',
          bottom: 'calc(var(--mui-spacing) * 2)',
          right: 'calc(var(--mui-spacing) * 2)'
        },
        '& .getting-started': {
          gridRowStart: { lg: 1 },
          gridRowEnd: { lg: 3 }
        },
        '& .dev-vlog': {
          gridRowStart: { lg: 1 },
          gridRowEnd: { lg: 2 }
        },
        '& .howto-and-contributions': {
          gridRowStart: { lg: 1 },
          gridRowEnd: { lg: 4 }
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
        '& .updates-and-projects > *:not(.MuiDivider-root)': {
          height: { md: '50%' },
          overflowY: { md: 'auto' }
        },
        '& .updates-and-projects': {
          overflowY: { md: 'hidden' }
        }
      }}
    >
      <GettingStarted />
      <DevVlog />
      <div className='howto-and-contributions'>
        <KeyboardShortcuts />
        <SceneNavigationHints />
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
