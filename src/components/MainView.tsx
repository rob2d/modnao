import { useCallback, useContext } from 'react';
import clsx from 'clsx';
import GuiPanel from './panel/GuiPanel';
import SceneCanvas from './scene/SceneCanvas';
import { Button, Paper, styled, Tooltip, Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { AppDialog, AppInfo } from './dialogs';
import {
  selectHasLoadedFile,
  selectHasLoadedPolygonFile,
  showDialog,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { useDebounce } from '@uidotdev/usehooks';

const Styled = styled('main')(
  ({ theme }) => `
    & {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100vh;
      flex-basis: 100%;
    }

    & > :first-child {
      position: relative;
      flex-grow: 1;
      height: 100%;
      display: flex;
      zIndex: -1;
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
      padding: ${theme.spacing(2)}
    }
  `
);

export default function MainView() {
  const { guiPanelVisible } = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();
  const onShowAppInfoDialog = useCallback(() => {
    dispatch(showDialog('app-info'));
  }, [dispatch]);

  const hasLoadedFileValue = useAppSelector(selectHasLoadedFile);
  const hasLoadedPolygonFile = useAppSelector(selectHasLoadedPolygonFile);
  const hasLoadedFile = useDebounce(hasLoadedFileValue, 500);
  let mainScene;

  if (hasLoadedFile) {
    mainScene = hasLoadedPolygonFile ? (
      <SceneCanvas />
    ) : (
      <div className='welcome-panel'>
        <Typography variant='h6'>Texture-only mode</Typography>
        <Typography variant='subtitle2'>
          No associated polygon/model files with these textures to display a
          scene.
        </Typography>
      </div>
    );
  } else {
    mainScene = (
      <div className='welcome-panel'>
        <Paper variant='outlined'>
          <AppInfo />
        </Paper>
      </div>
    );
  }

  return (
    <Styled>
      <div>
        {mainScene}
        {!hasLoadedFile ? undefined : (
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
    </Styled>
  );
}
