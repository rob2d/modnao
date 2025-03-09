import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import 'jimp';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { Divider, styled, Tooltip } from '@mui/material';
import TextureColorOptions from '../../TextureColorOptions';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { useTextureOptions } from '@/hooks';

const StyledMenuButtonContainer = styled('div')(
  ({ theme }) => `& {
    position: absolute;
    top: ${theme.spacing(1)};
    right: ${theme.spacing(0)};
  }

  & .MuiIconButton-root svg {
    color: ${theme.palette.primary.contrastText};
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.8));
  }`
);

const StyledMenu = styled(Menu)(
  ({ theme }) => `
    li.MuiMenuItem-root > svg {
      margin-right: ${theme.spacing(2)};
    }
    `
);

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
  onReplaceImageFile: (file: File) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // @TODO: extract translucency for use in global context
  // so this can be used with "Download All Textures" functionality

  // when menu is open, toggle translucent download
  // when hotkey is pressed
  const translucentHotkeyPressed = useKeyPress({ targetKey: 't' });
  const [dlAsTranslucent, setDlAsTranslucent] = useState(() => false);

  useEffect(() => {
    if (open && translucentHotkeyPressed) {
      setDlAsTranslucent(!dlAsTranslucent);
    }
  }, [open && translucentHotkeyPressed]);

  useEffect(() => {
    if (!open && dlAsTranslucent) {
      setDlAsTranslucent(false);
    }
  }, [dlAsTranslucent && !open]);

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
    <StyledMenuButtonContainer>
      <IconButton color='primary' aria-haspopup='true' onClick={handleClick}>
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
      <StyledMenu
        style={MENU_OFFSET_STYLE}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={MENU_ANCHOR_ORIGIN}
      >
        {options}
        <Divider />
        <TextureColorOptions textureIndex={textureIndex} variant='menu' />
      </StyledMenu>
    </StyledMenuButtonContainer>
  );
}
