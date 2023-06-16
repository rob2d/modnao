import { useState, MouseEvent, useMemo, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { Divider, styled } from '@mui/material';
import { useFilePicker } from 'use-file-picker';
import { replaceTextureDataUrl, useAppDispatch } from '@/store';
import GuiPanelTextureHSLOptions from './GuiPanelTextureHslOptions';

const StyledPanelTextureMenu = styled('div')(
  ({ theme }) => `& {
        position: absolute;
        top: ${theme.spacing(1)};
        right: ${theme.spacing(0)};
    }

    & .MuiIconButton-root svg {
        color: #fff;
        filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.8));
    }
    `
);

function useTextureReplacementPicker(textureIndex: number) {
  const dispatch = useAppDispatch();
  const [openFileSelector, { filesContent }] = useFilePicker({
    multiple: false,
    readAs: 'DataURL',
    accept: ['image/*']
  });

  useEffect(() => {
    if (!filesContent[0]) {
      return;
    }
    const [file] = filesContent;
    const dataUrl = file.content;
    dispatch(replaceTextureDataUrl({ dataUrl, textureIndex }));
  }, [filesContent]);

  return openFileSelector;
}

export default function GuiPanelTextureMenu({
  textureIndex,
  dataUrl
}: {
  textureIndex: number;
  dataUrl: string;
}) {
  const openFileSelector = useTextureReplacementPicker(textureIndex);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const options = useMemo(
    () => [
      {
        label: 'Download',
        onClick: () => {
          const a = document.createElement('a');
          a.download = `modnao-texture-${textureIndex}.png`;
          a.href = dataUrl;
          a.click();
          handleClose();
        }
      },
      {
        label: 'Replace (Preview)',
        onClick: () => {
          openFileSelector();
          handleClose();
        }
      }
    ],
    [dataUrl, textureIndex, openFileSelector, handleClose]
  );

  return (
    <StyledPanelTextureMenu>
      <IconButton
        color='primary'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
      >
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{ 'aria-labelledby': 'long-button' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem key={option.label} onClick={option.onClick}>
            {option.label}
          </MenuItem>
        ))}
        <Divider />
        <GuiPanelTextureHSLOptions textureIndex={textureIndex} />
      </Menu>
    </StyledPanelTextureMenu>
  );
}
