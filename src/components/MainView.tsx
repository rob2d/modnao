import { useContext } from 'react';
import GuiPanel from './panel/GuiPanel';
import SceneCanvas from './scene/SceneCanvas';
import { Button, styled, Tooltip } from '@mui/material';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import clsx from 'clsx';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useDialogState } from '@/hooks';
import { AppDialog, AppInfo } from './dialogs';

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
  `
);

export default function MainView() {
  const [infoShown, onShowInfoDialog, onCloseInfoDialog] = useDialogState(true);
  const { guiPanelVisible } = useContext(ViewOptionsContext);

  return (
    <Styled>
      <div>
        <SceneCanvas />
        <Tooltip
          title='View app info and usage tips'
          disableInteractive={!guiPanelVisible}
          placement='left'
        >
          <Button
            onClick={onShowInfoDialog}
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
      </div>
      <GuiPanel />
      <AppDialog open={infoShown} onClose={onCloseInfoDialog} fullWidth>
        <AppInfo onCloseDialog={onCloseInfoDialog} />
      </AppDialog>
    </Styled>
  );
}
