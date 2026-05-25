import { useCallback } from 'react';
import { Box, Button } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronDoubleRight } from '@mdi/js';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevVlog from './sections/DevVlog';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';
import { useScrollEdges } from '@/hooks';
import { closeDialog } from '@/modules/dialogs';
import { selectIsAppInfoDialogShown } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

export default function AppInfo() {
  const dispatch = useAppDispatch();
  const {
    containerRef: howToAndContributionsRef,
    hasScrollAbove: howToAndContributionsHasScrollAbove,
    hasScrollBelow: howToAndContributionsHasScrollBelow,
    scrollEdgeStyle: howToAndContributionsScrollEdgeStyle
  } = useScrollEdges<HTMLDivElement>();

  const onClose = useCallback(() => {
    dispatch(closeDialog());
  }, []);

  const isAppInfoDialogShown = useAppSelector(selectIsAppInfoDialogShown);

  return (
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        minHeight: 0,
        gridTemplateColumns: { xs: 'none', lg: '5fr 7fr 5fr' },
        gridTemplateRows: { xs: '1fr 1fr 1fr 1fr', lg: '1fr 1fr' },
        gap: 1,
        '& .app-info-section:not(:last-child):not(.MuiDivider-root)': {
          mb: 2
        },
        '& .MuiCardContent-root.MuiCardContent-root': {
          py: 1,
          px: 2
        },
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
          minHeight: 0,
          overflow: 'hidden'
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
      <Box
        className='app-info-section howto-and-contributions'
        data-scroll-above={howToAndContributionsHasScrollAbove}
        data-scroll-below={howToAndContributionsHasScrollBelow}
        style={howToAndContributionsScrollEdgeStyle}
        sx={(theme) => theme.mixins.dialogScrollEdgeFrame}
      >
        <Box
          ref={howToAndContributionsRef}
          sx={(theme) => theme.mixins.dialogScrollEdgeScroller}
        >
          <KeyboardShortcuts />
          <SceneNavigationHints />
          <Contributors />
        </Box>
        {!isAppInfoDialogShown ? null : (
          <Button variant='outlined' className='ok-button' onClick={onClose}>
            OK <Icon path={mdiChevronDoubleRight} size={1} />
          </Button>
        )}
      </Box>
      <OtherProjects />
    </Box>
  );
}
