import { useCallback, useContext } from 'react';
import type { ColorResult } from 'react-color';
import ContrastIcon from '@mui/icons-material/Contrast';
import {
  Box,
  IconButton,
  ScenePalette,
  Tooltip,
  useTheme
} from '@mui/material';
import ColorPickerSwatch from '@/components/ColorPickerSwatch';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

const SCENE_PALETTE_SWATCHES: ReadonlyArray<{
  key: keyof ScenePalette;
  label: string;
}> = [
  { key: 'background', label: 'Background' },
  { key: 'default', label: 'Wireframe' },
  { key: 'selected', label: 'Selections' }
];

export default function PaletteEditor() {
  const {
    palette: { scene: scenePalette }
  } = useTheme();

  const sceneOptions = useContext(SceneOptionsContext);

  const onChangeColor = useCallback(
    (key: keyof ScenePalette) =>
      ({ hex }: ColorResult) => {
        if (scenePalette[key] === hex) {
          return;
        }

        sceneOptions.setScenePalette({
          ...scenePalette,
          [key]: hex
        });
      },
    [sceneOptions, scenePalette]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {SCENE_PALETTE_SWATCHES.map(({ key, label }) => (
          <Tooltip title={label} key={key}>
            <Box component='span'>
              <ColorPickerSwatch
                ariaLabel={`Choose ${label.toLowerCase()} scene color`}
                color={scenePalette[key] ?? '#000000'}
                swatchColor={scenePalette[key] ?? '#000000'}
                onChange={onChangeColor(key)}
                swatchSx={{
                  width: 'calc(var(--mui-spacing) * 2.5)',
                  height: 'calc(var(--mui-spacing) * 2.5)',
                  borderWidth: 2
                }}
              />
            </Box>
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
      </Box>
    </Box>
  );
}
