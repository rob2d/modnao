import { MouseEvent, useCallback, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { Box, Divider, Tooltip } from '@mui/material';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { TextureColorOptions, useTextureOptions } from '@/modules/model-data';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

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
              <Icon path={o.iconPath} size={1} />
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
        <Icon path={mdiDotsVertical} size={1} />
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
        <Divider />
        <TextureColorOptions textureIndex={textureIndex} variant='menu' />
      </Menu>
    </Box>
  );
}
