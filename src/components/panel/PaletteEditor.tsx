import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  ButtonBase,
  IconButton,
  Popover,
  ScenePalette,
  Tooltip,
  styled,
  useTheme
} from '@mui/material';
import clsx from 'clsx';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import Icon from '@mdi/react';
import { mdiThemeLightDark } from '@mdi/js';

const Styled = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      flex-direction: column;
      width: 100%;
      align-items: flex-end;
    }

    & .color {
      display: flex;
      align-items: center;
    }

    & .color:not(:last-child) {
      margin-right: ${theme.spacing(1)};
    }

    & div.buttons {
      display: flex;
      align-items: center;

      & .color.selected .MuiTypography-button {
        color: ${theme.palette.primary.main};
      }

      & .color.selected .color-box {
        border-color: ${theme.palette.primary.main};
      }

      & .color-box {
        border-width: 2px;
        border-style: solid;
        width: ${theme.spacing(4)};
        height: ${theme.spacing(4)};
      }
    }

    & .MuiDivider {
      display: flex;
      align-items: center;
    }

    & .MuiTypography-subtitle2 {
      display: flex;
      align-items: center;
    }

    & .popover {
      position: fixed;
      zIndex: 2;
      left: -30px;
    }

    /* escapes the popover from the overflow of the main view */
    & .popover-content {
      position: fixed;
    }

    & .cover {
      position: fixed;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
      overflow: visible;
    }

    & .picker {
      margin-right: 32px;
    }
    `
);

const buttonsKeyMap = new Map<string, string>([
  ['background', 'Background'],
  ['default', 'Wireframe'],
  ['selected', 'Selections']
]);

const POPOVER_ANCHOR_ORIGIN = {
  vertical: 'top',
  horizontal: 'left'
} as const;

const POPOVER_TRANSFORM_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'left'
} as const;

export default function PaletteEditor() {
  const {
    palette: { scene: scenePalette }
  } = useTheme();

  const viewOptions = useContext(ViewOptionsContext);

  const [buttonsKey, setPaletteKey] = useState<keyof ScenePalette | undefined>(
    () => undefined
  );

  const onCloseColorPicker = useCallback(() => {
    setPaletteKey(undefined);
    setPickerAnchorEl(null);
  }, [buttonsKey]);

  const onChangeColor = useCallback(
    ({ hex }: { hex: string }) => {
      if ((buttonsKey && scenePalette[buttonsKey] === hex) || !buttonsKey) {
        return;
      }
      viewOptions.setScenePalette({
        ...scenePalette,
        [buttonsKey]: hex
      });

      return false;
    },
    [scenePalette, buttonsKey]
  );

  const [pickerAnchorEl, setPickerAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(() => null);

  const colorBoxStyles = useMemo(
    () =>
      Object.fromEntries(
        [...buttonsKeyMap.keys()].map((key) => [
          key,
          {
            backgroundColor: scenePalette[key as keyof ScenePalette]
          }
        ])
      ),
    [scenePalette]
  );

  return (
    <Styled>
      <div className='buttons'>
        {[...buttonsKeyMap.entries()].map(([key, label]) => (
          <Tooltip title={label} key={key}>
            <ButtonBase
              className={clsx('color', key === buttonsKey && 'selected')}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                setPaletteKey(key as keyof ScenePalette);
                setPickerAnchorEl(event.currentTarget);
              }}
            >
              <div className='color-box' style={colorBoxStyles[key]} />
            </ButtonBase>
          </Tooltip>
        ))}
        <Tooltip title='Reset or toggle light/dark theme'>
          <IconButton onClick={viewOptions.toggleLightDarkTheme}>
            <Icon path={mdiThemeLightDark} size={1} />
          </IconButton>
        </Tooltip>
      </div>
      {!buttonsKey ? undefined : (
        <Popover
          open={Boolean(pickerAnchorEl)}
          anchorEl={pickerAnchorEl}
          onClose={onCloseColorPicker}
          anchorOrigin={POPOVER_ANCHOR_ORIGIN}
          transformOrigin={POPOVER_TRANSFORM_ORIGIN}
        >
          <SketchPicker
            className='picker'
            color={buttonsKey && scenePalette[buttonsKey]}
            onChange={onChangeColor}
          />
        </Popover>
      )}
    </Styled>
  );
}
