import { MouseEvent, useCallback, useMemo, useState } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Divider, Tooltip } from '@mui/material';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import {
  TextureColorOptions,
  useTextureModelReferences,
  useTextureOptions
} from '@/modules/model-data';
import type { TextureModelReference } from '@/modules/model-data';
import { setModelMeshSelection } from '@/modules/object-viewer';
import { selectModelIndex } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

/**
 * menu sits on a Popper, so it is a bit cleaner
 * to keep things modular and just use style constant here
 */
const MENU_OFFSET_STYLE = { transform: 'translateX(-200px)' } as const;
const MENU_ANCHOR_ORIGIN = { vertical: 'top', horizontal: 'left' } as const;

export default function GuiPanelTextureMenu({
  textureIndex,
  pixelBufferKeys,
  onReplaceImageFile
}: {
  textureIndex: number;
  pixelBufferKeys: TextureImageBufferKeys;
  onReplaceImageFile: (file: File | SharedArrayBuffer) => void;
}) {
  const dispatch = useAppDispatch();
  const currentModelIndex = useAppSelector(selectModelIndex);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [referencesAnchorEl, setReferencesAnchorEl] =
    useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const referencesOpen = Boolean(referencesAnchorEl);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setReferencesAnchorEl(null);
  }, [setAnchorEl]);

  function handleOpenReferences(event: MouseEvent<HTMLElement>) {
    setReferencesAnchorEl(event.currentTarget);
  }

  function handleCloseReferences() {
    setReferencesAnchorEl(null);
  }

  const modelReferences: TextureModelReference[] = useTextureModelReferences(
    textureIndex,
    open
  );

  function onSelectModelReference({
    modelIndex,
    meshIndexes
  }: TextureModelReference) {
    dispatch(setModelMeshSelection({ modelIndex, meshIndex: meshIndexes[0] }));
    handleClose();
  }

  const optionsSources = useTextureOptions(
    textureIndex,
    pixelBufferKeys,
    onReplaceImageFile,
    handleClose,
    !open
  );

  const options = useMemo(
    () =>
      optionsSources.map((o, i) => (
        <Tooltip title={o.tooltip} key={i} placement='left'>
          <MenuItem onClick={o.onClick} disabled={o.disabled}>
            <>
              {o.icon}
              {o.label}
            </>
          </MenuItem>
        </Tooltip>
      )),
    [optionsSources]
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 'var(--mui-spacing)',
        right: 0,
        '& .MuiIconButton-root svg': {
          color: 'var(--mui-palette-primary-contrastText)',
          filter: 'drop-shadow(3px 5px 2px rgb(0 0 0 / 0.8))'
        }
      }}
    >
      <IconButton color='primary' aria-haspopup='true' onClick={handleClick}>
        <MoreVertIcon fontSize='small' />
      </IconButton>
      <Menu
        style={MENU_OFFSET_STYLE}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        sx={{
          'li.MuiMenuItem-root > svg': {
            mr: 2
          }
        }}
      >
        {options}
        <Tooltip
          title={
            modelReferences.length
              ? 'Show models that use this texture'
              : 'No loaded models use this texture'
          }
          placement='left'
        >
          <MenuItem
            onClick={handleOpenReferences}
            disabled={!modelReferences.length}
            sx={{ display: 'flex', minWidth: 220 }}
          >
            <AccountTreeIcon fontSize='small' />
            <Box component='span' sx={{ flexGrow: 1 }}>
              Model usage ({modelReferences.length})
            </Box>
            <KeyboardArrowRightIcon
              fontSize='small'
              sx={{ ml: 'auto', mr: 0 }}
            />
          </MenuItem>
        </Tooltip>
        <Menu
          anchorEl={referencesAnchorEl}
          open={referencesOpen}
          onClose={handleCloseReferences}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{
            'li.MuiMenuItem-root': {
              minWidth: 190
            }
          }}
        >
          {modelReferences.map((reference: TextureModelReference) => (
            <MenuItem
              key={reference.modelIndex}
              onClick={() => onSelectModelReference(reference)}
              selected={reference.modelIndex === currentModelIndex}
              sx={{
                display: 'flex',
                gap: 2,
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
          ))}
        </Menu>
        <Divider />
        <TextureColorOptions textureIndex={textureIndex} variant='menu' />
      </Menu>
    </Box>
  );
}
