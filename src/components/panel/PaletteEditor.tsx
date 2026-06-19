import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';
import ContrastIcon from '@mui/icons-material/Contrast';
import {
  Box,
  ButtonBase,
  IconButton,
  Popover,
  ScenePalette,
  Tooltip,
  useTheme
} from '@mui/material';
import clsx from 'clsx';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

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

  const [pickerAnchorEl, setPickerAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(() => null);

  const sceneOptions = useContext(SceneOptionsContext);

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
      sceneOptions.setScenePalette({
        ...scenePalette,
        [buttonsKey]: hex
      });

      return false;
    },
    [scenePalette, buttonsKey]
  );

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'flex-end',
        '& .color': {
          display: 'flex',
          alignItems: 'center'
        },
        '& .color:not(:last-child)': {
          mr: 1
        },
        '& div.buttons': {
          display: 'flex',
          alignItems: 'center',
          '& .color.selected .MuiTypography-button': {
            color: 'var(--mui-palette-primary-main)'
          },
          '& .color.selected .color-box': {
            borderColor: 'var(--mui-palette-primary-main)'
          },
          '& .color-box': {
            borderWidth: '2px',
            borderStyle: 'solid',
            width: 'calc(var(--mui-spacing) * 2.5)',
            height: 'calc(var(--mui-spacing) * 2.5)'
          }
        },
        '& .MuiDivider': {
          display: 'flex',
          alignItems: 'center'
        },
        '& .MuiTypography-subtitle2': {
          display: 'flex',
          alignItems: 'center'
        },
        '& .popover': {
          position: 'fixed',
          zIndex: 2,
          left: '-30px'
        },
        '& .popover-content': {
          position: 'fixed'
        },
        '& .cover': {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'visible'
        },
        '& .picker': {
          mr: 4
        }
      }}
    >
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
        <Tooltip title='Reset or toggle light/dark scene theme'>
          <IconButton
            onClick={sceneOptions.toggleLightDarkTheme}
            sx={{ my: -1 }}
          >
            <ContrastIcon fontSize='small' />
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
    </Box>
  );
}
