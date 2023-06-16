import { useState, MouseEvent, useMemo, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mdi/react';
import { mdiDotsVertical, mdiFileDownload, mdiFileReplace } from '@mdi/js';
import { Divider, Tooltip, styled } from '@mui/material';
import { useFilePicker } from 'use-file-picker';
import { replaceTextureDataUrl, useAppDispatch } from '@/store';
import GuiPanelTextureHSLOptions from './GuiPanelTextureColorOptions';

const StyledMenuButtonContainer = styled('div')(
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

  const options = useMemo<
    { label: JSX.Element | string; tooltip: string; onClick: () => void }[]
  >(
    () => [
      {
        label: (
          <>
            <Icon path={mdiFileDownload} size={1} />
            Download
          </>
        ),
        tooltip: 'Download this texture as a PNG',
        onClick() {
          const a = document.createElement('a');
          a.download = `modnao-texture-${textureIndex}.png`;
          a.href = dataUrl;
          a.click();
          handleClose();
        }
      },
      {
        label: (
          <>
            <Icon path={mdiFileReplace} size={1} />
            Replace
          </>
        ),
        tooltip:
          'Replace this texture with another image file that is the same size',
        onClick() {
          openFileSelector();
          handleClose();
        }
      }
    ],
    [dataUrl, textureIndex, openFileSelector, handleClose]
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
        {options.map((option, i) => (
          <Tooltip title={option.tooltip} key={i}>
            <MenuItem onClick={option.onClick}>{option.label}</MenuItem>
          </Tooltip>
        ))}
        <Divider />
        <GuiPanelTextureHSLOptions textureIndex={textureIndex} />
      </StyledMenu>
    </StyledMenuButtonContainer>
  );
}
