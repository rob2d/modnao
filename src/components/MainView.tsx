import GuiPanel from './panel/GuiPanel';
import SceneCanvas from './scene/SceneCanvas';
import { Button, Tooltip, styled } from '@mui/material';
import Icon from '@mdi/react';
import { mdiInformationOutline, mdiPalette } from '@mdi/js';
import clsx from 'clsx';
import { useContext } from 'react';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import AppDialog from './AppDialog';
import AppInfo from './app-info/AppInfo';
import PaletteEditor from './palette-editor/PaletteEditor';
import { useDialogState } from '@/hooks';

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
  const [
    paletteEditorShown,
    onShowPaletteEditorDialog,
    onClosePaletteEditorDialog
  ] = useDialogState(false);
  const { guiPanelVisible } = useContext(ViewOptionsContext);

  return (
    <Styled>
      <div>
        <SceneCanvas />
        <Tooltip
          title='Customize scene palette'
          disableInteractive={!guiPanelVisible}
          placement='left'
        >
          <Button
            onClick={onShowPaletteEditorDialog}
            className={clsx(
              'scene-button',
              'palette-button',
              !guiPanelVisible && 'hidden'
            )}
            color='info'
          >
            <Icon path={mdiPalette} size={1.5} />
          </Button>
        </Tooltip>
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

      <AppDialog open={paletteEditorShown} onClose={onClosePaletteEditorDialog}>
        <PaletteEditor />
      </AppDialog>
    </Styled>
  );
}
