import type { TextureModelReference } from '@/modules/model-data';
import { useTextureModelReferences } from '@/modules/model-data';
import { navToTextureModelUsage } from '@/modules/object-viewer';

import LocationPinIcon from '@mui/icons-material/LocationPin';
import { Box, ListSubheader } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useCallback } from 'react';
import { $modelIndex } from '@/modules/object-viewer/objectViewerStore';

const MENU_ANCHOR_ORIGIN = { vertical: 'top', horizontal: 'left' } as const;
const MENU_TRANSFORM_ORIGIN = { vertical: 'top', horizontal: 'right' } as const;

export default function GuiPanelTextureModelNavMenu({
  textureIndex,
  onModelReferenceHover,
  anchorEl,
  open,
  onClose
}: {
  textureIndex: number;
  onModelReferenceHover: (reference: TextureModelReference | undefined) => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}) {
  'use no memo';

  const currentModelIndex = $modelIndex.value;

  const handleClose = useCallback(() => {
    onModelReferenceHover(undefined);
    onClose();
  }, [onClose, onModelReferenceHover]);

  const modelReferences = useTextureModelReferences(textureIndex, open);

  function onSelectModelReference({
    modelIndex,
    meshIndexes
  }: TextureModelReference) {
    navToTextureModelUsage({
      modelIndex,
      meshIndexes,
      textureIndex
    });
    handleClose();
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={MENU_ANCHOR_ORIGIN}
      transformOrigin={MENU_TRANSFORM_ORIGIN}
    >
      <ListSubheader component='div'>Texture models</ListSubheader>
      {!modelReferences.length ? (
        <MenuItem disabled sx={{ minWidth: 220 }}>
          No loaded models use this texture
        </MenuItem>
      ) : (
        modelReferences.map((reference) => (
          <MenuItem
            key={reference.modelIndex}
            onClick={() => onSelectModelReference(reference)}
            onMouseEnter={() => onModelReferenceHover(reference)}
            onMouseLeave={() => onModelReferenceHover(undefined)}
            selected={reference.modelIndex === currentModelIndex}
            sx={{
              display: 'flex',
              gap: 2,
              minWidth: 220,
              '&.Mui-selected, &.Mui-selected:hover': {
                backgroundColor: 'var(--mui-palette-action-hover)'
              }
            }}
          >
            <Box component='span' sx={{ flexGrow: 1 }}>
              {reference.modelName ?? `Model ${reference.modelIndex + 1}`}
            </Box>
            {reference.modelIndex === currentModelIndex ? (
              <LocationPinIcon
                fontSize='small'
                sx={{ color: 'var(--mui-palette-text-secondary)' }}
                titleAccess='Current model'
              />
            ) : null}
          </MenuItem>
        ))
      )}
    </Menu>
  );
}
