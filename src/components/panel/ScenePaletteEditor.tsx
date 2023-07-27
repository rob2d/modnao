import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  ButtonBase,
  Popover,
  ScenePalette,
  Tooltip,
  styled,
  useTheme
} from '@mui/material';
import clsx from 'clsx';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

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

    & div.palette {
      display: flex;
      align-items: flex-start;

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

const paletteKeyMap = new Map<string, string>([
  ['background', 'Background'],
  ['default', 'Wireframe'],
  ['selected', 'Selections']
]);

export default function ScenePaletteEditor() {
  const {
    palette: { scene: scenePalette }
  } = useTheme();

  const viewOptions = useContext(ViewOptionsContext);

  const [paletteKey, setPaletteKey] = useState<keyof ScenePalette | undefined>(
    () => undefined
  );

  const onCloseColorPicker = useCallback(() => {
    setPaletteKey(undefined);
    setPickerAnchorEl(null);
  }, [paletteKey]);

  const onChangeColor = useCallback(
    ({ hex }: { hex: string }) => {
      if ((paletteKey && scenePalette[paletteKey] === hex) || !paletteKey) {
        return;
      }
      viewOptions.setScenePalette({
        ...scenePalette,
        [paletteKey]: hex
      });

      return false;
    },
    [scenePalette, paletteKey]
  );

  const [pickerAnchorEl, setPickerAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(() => null);

  const colorBoxStyles = useMemo(
    () =>
      Object.fromEntries(
        [...paletteKeyMap.keys()].map((key) => [
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
      <div className='palette'>
        {[...paletteKeyMap.entries()].map(([key, label]) => (
          <Tooltip title={label} key={key}>
            <ButtonBase
              className={clsx('color', key === paletteKey && 'selected')}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                setPaletteKey(key as keyof ScenePalette);
                setPickerAnchorEl(event.currentTarget);
              }}
            >
              <div className='color-box' style={colorBoxStyles[key]} />
            </ButtonBase>
          </Tooltip>
        ))}
      </div>
      {!paletteKey ? undefined : (
        <Popover
          open={Boolean(pickerAnchorEl)}
          anchorEl={pickerAnchorEl}
          onClose={onCloseColorPicker}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top'
          }}
        >
          <SketchPicker
            className='picker'
            color={paletteKey && scenePalette[paletteKey]}
            onChange={onChangeColor}
          />
        </Popover>
      )}
    </Styled>
  );
}
