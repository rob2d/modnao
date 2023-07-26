import React, { useCallback, useContext, useState } from 'react';
import { SketchPicker } from 'react-color';
import DialogSectionHeader from '../DialogSectionHeader';
import { mdiPalette } from '@mdi/js';
import Icon from '@mdi/react';
import {
  ButtonBase,
  ScenePalette,
  Typography,
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
    }
    & .MuiTypography-h5 svg {
      margin-right: ${theme.spacing(1)};
    }

    & .color {
      display: flex;
      align-items: center;

      & > div:first-child {
        margin-right: ${theme.spacing(1)};
      }
    }

    & .content {
      display: flex;
    }

    & .palette {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-right: ${theme.spacing(3)};

      & .color.selected .MuiTypography-button {
        color: ${theme.palette.primary.main};
      }
    }
    `
);

const paletteKeyMap = new Map<string, string>([
  ['background', 'Background'],
  ['default', 'Wireframe'],
  ['selected', 'Selections']
]);

export default function PaletteEditor() {
  const {
    palette: { scene: scenePalette },
    spacing
  } = useTheme();

  const viewOptions = useContext(ViewOptionsContext);

  const [paletteKey, setPaletteKey] = useState<keyof ScenePalette>(
    () => 'background'
  );

  const onChangeColor = useCallback(
    ({ hex }: { hex: string }) => {
      console.log('setting scene palette ->', paletteKey, {
        ...scenePalette,
        [paletteKey]: hex
      });
      viewOptions.setScenePalette({
        ...scenePalette,
        [paletteKey]: hex
      });
    },
    [scenePalette, paletteKey]
  );

  return (
    <Styled>
      <DialogSectionHeader>
        <Icon path={mdiPalette} size={1} />
        Customize Scene Palette
      </DialogSectionHeader>
      <div className='content'>
        <div className='palette'>
          {[...paletteKeyMap.entries()].map(([key, label]) => (
            <ButtonBase
              key={key}
              className={clsx('color', key === paletteKey && 'selected')}
              onClick={() => setPaletteKey(key as keyof ScenePalette)}
            >
              <div
                style={{
                  backgroundColor: scenePalette[key as keyof ScenePalette],
                  width: spacing(4),
                  height: spacing(4)
                }}
              />
              <Typography variant='button'>{label}</Typography>
            </ButtonBase>
          ))}
        </div>
        <SketchPicker
          color={scenePalette[paletteKey]}
          onChangeComplete={onChangeColor}
        />
      </div>
    </Styled>
  );
}
