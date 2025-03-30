import { useCallback, useContext } from 'react';
import clsx from 'clsx';
import GuiPanel from './panel/GuiPanel';
import SceneView from './SceneView';
import {
  Backdrop,
  Button,
  CircularProgress,
  Paper,
  styled,
  Tooltip,
  useTheme
} from '@mui/material';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { AppDialog, AppInfo } from './dialogs';
import {
  selectContentViewMode,
  selectProcessingOverlayShown,
  showDialog,
  useAppDispatch,
  useAppSelector
} from '@/store';
import TextureView from './TextureView';
import ErrorMessage from './ErrorMessage';

const Styled = styled('main')(
  ({ theme }) => `
    & {
      position: relative;
      display: flex;
      align-items: center;
      height: 100vh;
      flex-basis: 100%;
    }

    & .MuiBackdrop-root: {
      z-index: 1;
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }

    ${
      process.env.JEST_WORKER_ID
        ? ''
        : `& > :first-child {
          position: relative;
          flex-grow: 1;
          height: 100%;
          display: flex;
          zIndex: -1;
        }`
    }

    .scene-button {
      position: absolute;
      right: ${theme.spacing(1)};
      transition: opacity 0.5s ease;
      opacity: 1;
      pointer-events: all;
    }

    .scene-button.hidden {
      pointer-events: none;
      opacity: 0;
    }
    
    .palette-button {
      bottom: ${theme.spacing(8)};
    }
    
    .info-button {
      bottom: ${theme.spacing(1)};
    }

    .info-button svg {
      filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
    }

    .welcome-panel {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${theme.spacing(1)} 0px ${theme.spacing(1)} ${theme.spacing(2)};
      max-height: 100vh;
      max-width: 100%;
    }

    .welcome-panel > .MuiPaper-root {
      height: 100%;
    }

    .welcome-panel > img {
      flex-shrink: 0;
    }

    .welcome-panel > div {
      display: flex;
      padding: ${theme.spacing(1)} ${theme.spacing(2)};
      max-height: 100%;
      max-width: 100%;
    }

    .welcome-panel > div > .MuiPaper-root {
      display: flex;
      padding: ${theme.spacing(2)};
    }

    .main-content {
      position: relative;
    }

    .main-content.full-view {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `
);

export default function MainView() {
  const { guiPanelExpansionLevel } = useContext(ViewOptionsContext);
  const theme = useTheme();
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
          <Paper variant='outlined'>
            <AppInfo />
          </Paper>
        </div>
      );
      break;
  }

  return (
    <>
      <ErrorMessage />
      <Styled>
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
                <Icon path={mdiInformationOutline} size={1.5} />
              </Button>
            </Tooltip>
          )}
        </div>
        <GuiPanel />
        <AppDialog />
        <Backdrop open={processingOverlayShown}>
          <svg width={0} height={0}>
            <defs>
              <linearGradient
                id='my_gradient'
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <stop offset='0%' stopColor={theme.palette.primary.main} />
                <stop offset='100%' stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </defs>
          </svg>
          <CircularProgress
            size={64}
            sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
          />
        </Backdrop>
      </Styled>
    </>
  );
}
