import GuiPanel from './panel/GuiPanel';
import SceneCanvas from './scene/SceneCanvas';
import { Button, Tooltip, styled } from '@mui/material';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import clsx from 'clsx';
import { useCallback, useContext, useState } from 'react';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import AppInfoDialog from './app-info/AppInfoDialog';

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
    
    .info-button {
      position: absolute;
      right: ${theme.spacing(0)};
      bottom: ${theme.spacing(1)};
      transition: opacity 0.5s ease;
      opacity: 1;
      pointer-events: all;
    }

    .info-button.hidden {
      pointer-events: none;
      opacity: 0;
    }

    .info-button svg {
      filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
    }
  `
);

export default function MainView() {
  const [infoShown, setInfoShown] = useState(true);
  const onCloseInfoDialog = useCallback(() => {
    infoShown && setInfoShown(false);
  }, [infoShown]);

  const onShowInfoDialog = useCallback(() => {
    if (!infoShown) {
      setInfoShown(true);
    }
  }, [infoShown]);
  const { guiPanelVisible } = useContext(ViewOptionsContext);

  return (
    <Styled>
      <div>
        <SceneCanvas />
        <Tooltip
          title='View app info and usage tips'
          disableInteractive={!guiPanelVisible}
        >
          <Button
            onClick={onShowInfoDialog}
            className={clsx('info-button', !guiPanelVisible && 'hidden')}
            color='info'
          >
            <Icon path={mdiInformationOutline} size={1} />
          </Button>
        </Tooltip>
      </div>
      <GuiPanel />
      <AppInfoDialog open={infoShown} onClose={onCloseInfoDialog} />
    </Styled>
  );
}
