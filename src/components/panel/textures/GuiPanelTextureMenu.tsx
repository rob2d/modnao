import { KeyboardEvent, useCallback, useMemo } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Divider, Tooltip } from '@mui/material';
import { TextureImageBufferKeys, UvClipPath } from '@/utils/textures';
import { TextureColorOptions, useTextureOptions } from '@/modules/model-data';

const MENU_ANCHOR_ORIGIN = { vertical: 'top', horizontal: 'left' } as const;
const MENU_TRANSFORM_ORIGIN = { vertical: 'top', horizontal: 'right' } as const;

export default function GuiPanelTextureMenu({
  textureIndex,
  pixelBufferKeys,
  selectedUvClipPaths,
  onReplaceImageFile,
  anchorEl,
  open,
  onClose
}: {
  textureIndex: number;
  pixelBufferKeys: TextureImageBufferKeys;
  selectedUvClipPaths: UvClipPath[];
  onReplaceImageFile: (file: File | SharedArrayBuffer) => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}) {
  const onMenuItemKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
  }, []);

  const optionsSources = useTextureOptions(
    textureIndex,
    pixelBufferKeys,
    onReplaceImageFile,
    onClose,
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
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
  );
}
