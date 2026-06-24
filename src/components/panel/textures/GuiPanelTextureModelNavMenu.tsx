import { MouseEvent, useCallback, useRef, useState } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, ListSubheader, Tooltip } from '@mui/material';
import { useTextureModelReferences } from '@/modules/model-data';
import type { TextureModelReference } from '@/modules/model-data';
import { setModelMeshSelection } from '@/modules/object-viewer';
import { selectModelIndex } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

const MENU_ANCHOR_ORIGIN = { vertical: 'top', horizontal: 'left' } as const;
const MENU_TRANSFORM_ORIGIN = { vertical: 'top', horizontal: 'right' } as const;

export default function GuiPanelTextureModelNavMenu({
  textureIndex,
  onModelReferenceHover
}: {
  textureIndex: number;
  onModelReferenceHover: (reference: TextureModelReference | undefined) => void;
}) {
  const dispatch = useAppDispatch();
  const currentModelIndex = useAppSelector(selectModelIndex);
  const menuButtonContainerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(
      menuButtonContainerRef.current?.parentElement ?? event.currentTarget
    );
  }, []);

  const handleClose = useCallback(() => {
    onModelReferenceHover(undefined);
    setAnchorEl(null);
  }, [onModelReferenceHover]);

  const modelReferences = useTextureModelReferences(textureIndex, open);

  function onSelectModelReference({
    modelIndex,
    meshIndexes
  }: TextureModelReference) {
    dispatch(
      setModelMeshSelection({
        modelIndex,
        meshIndex: meshIndexes[0],
        textureIndex
      })
    );
    handleClose();
  }

  return (
    <Box
      ref={menuButtonContainerRef}
      sx={{
        position: 'absolute',
        top: 'calc(var(--mui-spacing) * 6)',
        right: 0,
        '& .MuiIconButton-root': {
          opacity: 0,
          transition: (t) => `opacity ${t.transitions.duration.short}ms`
        },
        '& .MuiIconButton-root svg': {
          color: 'var(--mui-palette-primary-contrastText)',
          filter: 'drop-shadow(3px 5px 2px rgb(0 0 0 / 0.8))'
        }
      }}
    >
      <Tooltip title='Find models this texture is used in'>
        <IconButton
          color='primary'
          aria-haspopup='true'
          onClick={handleClick}
          sx={{ visibility: open ? 'hidden' : 'visible' }}
        >
          <AccountTreeIcon fontSize='small' />
        </IconButton>
      </Tooltip>
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
    </Box>
  );
}
