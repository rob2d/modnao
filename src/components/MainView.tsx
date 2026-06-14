import { useCallback, useContext } from 'react';
import GuiPanel from './panel/GuiPanel';
import SceneView from './SceneView';
import {
  Backdrop,
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { AppDialog, AppInfo } from './dialogs';
import { showDialog } from '@/modules/dialogs';
import {
  selectContentViewMode,
  selectProcessingOverlayShown
} from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import TextureView from './TextureView';
import ErrorMessage from './ErrorMessage';

export default function MainView() {
  const {
    enableCinematicMode,
    guiPanelExpansionLevel,
    setEnableCinematicMode,
    setShowBrowsedObjectHints,
    showBrowsedObjectHints
  } = useContext(SceneOptionsContext);

  const dispatch = useAppDispatch();

  const onShowAppInfoDialog = useCallback(() => {
    dispatch(showDialog('app-info'));
  }, [dispatch]);

  const onShowBrowsedObjectHints = useCallback(() => {
    setShowBrowsedObjectHints(true);

    if (enableCinematicMode) {
      setEnableCinematicMode(false);
    }
  }, [enableCinematicMode, setEnableCinematicMode, setShowBrowsedObjectHints]);

  const onEnableCinematicMode = useCallback(() => {
    setEnableCinematicMode(true);
  }, [setEnableCinematicMode]);

  const contentViewMode = useAppSelector(selectContentViewMode);
  const processingOverlayShown = useAppSelector(selectProcessingOverlayShown);

  let mainScene;

  const effectiveGuiPanelExpansionLevel = enableCinematicMode
    ? 0
    : guiPanelExpansionLevel;
  const guiPanelVisible =
    contentViewMode === 'welcome' || effectiveGuiPanelExpansionLevel > 0;
  const showBrowsedObjectHintsButtonVisible =
    contentViewMode === 'polygons' &&
    (!showBrowsedObjectHints || enableCinematicMode);
  const sceneButtonHidden = !guiPanelVisible;

  switch (contentViewMode) {
    case 'polygons':
      mainScene = <SceneView />;
      break;
    case 'textures':
      mainScene = <TextureView />;
      break;
    default:
      mainScene = (
        <Box
          sx={{
            boxSizing: 'border-box',
            display: 'flex',
            py: 1,
            px: 2,
            maxHeight: '100vh',
            maxWidth: '100%',
            height: '100%',
            '& > img': {
              flexShrink: 0
            },
            '& > div > .MuiPaper-root': {
              display: 'flex',
              px: 0,
              py: 2
            }
          }}
        >
          <AppInfo />
        </Box>
      );
      break;
  }

  return (
    <>
      <ErrorMessage />
      <Box
        component='main'
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '100vh',
          flexBasis: '100%'
        }}
      >
        <Box
          sx={{
            position: !guiPanelVisible ? 'absolute' : 'relative',
            top: !guiPanelVisible ? 0 : undefined,
            left: !guiPanelVisible ? 0 : undefined,
            width: !guiPanelVisible ? '100%' : undefined,
            height: '100%',
            display: process.env.JEST_WORKER_ID ? undefined : 'flex',
            flexGrow: process.env.JEST_WORKER_ID ? undefined : 1
          }}
        >
          {mainScene}
          {contentViewMode !== 'polygons' ? null : (
            <IconButton
              onClick={onShowBrowsedObjectHints}
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                right: 0,
                mr: 2,
                mt: 1,
                '& svg': {
                  ...theme.mixins.sceneIconMixin
                }
              })}
            >
              <SearchIcon fontSize='medium' />
            </IconButton>
          )}
          {contentViewMode !== 'polygons' ? null : (
            <>
              {!showBrowsedObjectHintsButtonVisible ? null : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '48px',
                    height: '100%',
                    '&:hover > button': {
                      pointerEvents: 'auto'
                    },
                    '&:hover > button svg': {
                      opacity: 1
                    }
                  }}
                >
                  <IconButton
                    onClick={onShowBrowsedObjectHints}
                    sx={(theme) => ({
                      position: 'absolute',
                      top: 'var(--mui-spacing)',
                      left: 'var(--mui-spacing)',
                      pointerEvents: 'none',
                      '& svg': {
                        ...theme.mixins.sceneIconMixin,
                        opacity: 0,
                        transition: 'opacity 0.5s ease'
                      }
                    })}
                  >
                    <HelpCenterIcon fontSize='medium' />
                  </IconButton>
                </Box>
              )}
              <Tooltip
                title='View app info and usage tips'
                disableInteractive={!guiPanelVisible}
                placement='left'
              >
                <IconButton
                  onClick={onShowAppInfoDialog}
                  color='info'
                  sx={(theme) => ({
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    mr: 1,
                    mb: 1,
                    transition: 'opacity 0.5s ease',
                    opacity: sceneButtonHidden ? 0 : 1,
                    pointerEvents: sceneButtonHidden ? 'none' : 'all',
                    '& svg': theme.mixins.sceneIconMixin
                  })}
                >
                  <InfoOutlinedIcon fontSize='medium' />
                </IconButton>
              </Tooltip>
              <Tooltip
                title='Enter cinematic mode'
                disableInteractive={!guiPanelVisible}
                placement='left'
              >
                <IconButton
                  onClick={onEnableCinematicMode}
                  color='info'
                  sx={(theme) => ({
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    mr: 7,
                    mb: 1,
                    transition: 'opacity 0.5s ease',
                    opacity: sceneButtonHidden ? 0 : 1,
                    pointerEvents: sceneButtonHidden ? 'none' : 'all',
                    '& svg': theme.mixins.sceneIconMixin
                  })}
                >
                  <VideocamIcon fontSize='medium' />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
        <GuiPanel />
        <AppDialog />
        <Backdrop
          open={processingOverlayShown}
          sx={{ zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
          <svg width={0} height={0}>
            <defs>
              <linearGradient
                id='my_gradient'
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <stop offset='0%' stopColor='var(--mui-palette-primary-main)' />
                <stop
                  offset='100%'
                  stopColor='var(--mui-palette-secondary-main)'
                />
              </linearGradient>
            </defs>
          </svg>
          <CircularProgress
            size={64}
            sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
          />
        </Backdrop>
      </Box>
    </>
  );
}
