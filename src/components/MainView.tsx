import { useCallback, useContext } from 'react';
import clsx from 'clsx';
import GuiPanel from './panel/GuiPanel';
import SceneView from './SceneView';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const { guiPanelExpansionLevel } = useContext(SceneOptionsContext);
  const dispatch = useAppDispatch();
  const onShowAppInfoDialog = useCallback(() => {
    dispatch(showDialog('app-info'));
  }, [dispatch]);

  const contentViewMode = useAppSelector(selectContentViewMode);
  const processingOverlayShown = useAppSelector(selectProcessingOverlayShown);

  let mainScene;

  const guiPanelVisible =
    contentViewMode === 'welcome' || guiPanelExpansionLevel > 0;

  switch (contentViewMode) {
    case 'polygons':
      mainScene = <SceneView />;
      break;
    case 'textures':
      mainScene = <TextureView />;
      break;
    default:
      mainScene = (
        <div className='welcome-panel'>
          <AppInfo />
        </div>
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
          flexBasis: '100%',
          ...(process.env.JEST_WORKER_ID
            ? {}
            : {
                '& > :first-child': {
                  position: 'relative',
                  flexGrow: 1,
                  height: '100%',
                  display: 'flex'
                }
              }),
          '& .scene-button': {
            position: 'absolute',
            right: 'var(--mui-spacing)',
            transition: 'opacity 0.5s ease',
            opacity: 1,
            pointerEvents: 'all'
          },
          '& .scene-button.hidden': {
            pointerEvents: 'none',
            opacity: 0
          },
          '& .palette-button': {
            bottom: 'calc(var(--mui-spacing) * 8)'
          },
          '& .info-button': {
            bottom: 'var(--mui-spacing)'
          },
          '& .info-button svg': {
            filter: 'drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))'
          },
          '& .welcome-panel': {
            boxSizing: 'border-box',
            display: 'flex',
            py: 1,
            px: 2,
            maxHeight: '100vh',
            maxWidth: '100%',
            height: '100%'
          },
          '& .welcome-panel > img': {
            flexShrink: 0
          },
          '& .welcome-panel > div > .MuiPaper-root': {
            display: 'flex',
            px: 0,
            py: 2
          },
          '& .main-content': {
            position: 'relative'
          },
          '& .main-content.full-view': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }
        }}
      >
        <div
          className={clsx(
            'main-content',
            // when gui panel collapsed, take entire view so that
            // the scene is fully rendered. In this mode, gui panel
            // is hidden but can be hovered & clicked to expand
            !guiPanelVisible && 'full-view'
          )}
        >
          {mainScene}
          {contentViewMode === 'welcome' ? undefined : (
            <Tooltip
              title='View app info and usage tips'
              disableInteractive={!guiPanelVisible}
              placement='left'
            >
              <Button
                onClick={onShowAppInfoDialog}
                className={clsx(
                  'scene-button',
                  'info-button',
                  !guiPanelVisible && 'hidden'
                )}
                color='info'
              >
                <InfoOutlinedIcon fontSize='medium' />
              </Button>
            </Tooltip>
          )}
        </div>
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
