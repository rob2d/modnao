import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useMemo,
  useState
} from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Divider, Tooltip } from '@mui/material';
import { TextureImageBufferKeys, UvClipPath } from '@/utils/textures';
import { TextureColorOptions, useTextureOptions } from '@/modules/model-data';

const MENU_ANCHOR_ORIGIN = { vertical: 'top', horizontal: 'left' } as const;
const MENU_TRANSFORM_ORIGIN = { vertical: 'top', horizontal: 'right' } as const;

export default function GuiPanelTextureMenu({
  textureIndex,
  pixelBufferKeys,
  selectedUvClipPaths,
  onReplaceImageFile
}: {
  textureIndex: number;
  pixelBufferKeys: TextureImageBufferKeys;
  selectedUvClipPaths: UvClipPath[];
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

  const onMenuItemKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
  }, []);

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
          <MenuItem
            onClick={o.onClick}
            disabled={o.disabled}
            onKeyDown={onMenuItemKeyDown}
          >
            <>
              {o.icon}
              {o.label}
            </>
          </MenuItem>
        </Tooltip>
      )),
    [onMenuItemKeyDown, optionsSources]
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        mt: 1,
        '& .MuiIconButton-root': {
          opacity: open ? 1 : 0,
          transition: (t) => `opacity ${t.transitions.duration.short}ms`
        },
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
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        transformOrigin={MENU_TRANSFORM_ORIGIN}
        sx={{ 'li.MuiMenuItem-root > svg': { mr: 2 } }}
      >
        {options}
        <Divider />
        <TextureColorOptions
          textureIndex={textureIndex}
          variant='menu'
          selectedUvClipPaths={selectedUvClipPaths}
        />
      </Menu>
    </Box>
  );
}
