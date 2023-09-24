import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import 'jimp';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mdi/react';
import {
  mdiDotsVertical,
  mdiFileDownload,
  mdiFileReplace,
  mdiFileUndo
} from '@mdi/js';
import { Divider, styled, Tooltip } from '@mui/material';
import { objectUrlToBuffer } from '@/utils/data';
import { useFilePicker } from 'use-file-picker';
import GuiPanelTextureHSLOptions from './GuiPanelTextureColorOptions';
import { revertTextureImage, useAppDispatch, useAppSelector } from '@/store';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { Jimp } = globalThis as any;

const StyledMenuButtonContainer = styled('div')(
  ({ theme }) => `& {
        position: absolute;
        top: ${theme.spacing(1)};
        right: ${theme.spacing(0)};
    }

    & .MuiIconButton-root svg {
        color: ${theme.palette.primary.contrastText};
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

function useTextureReplacementPicker(onReplaceImageFile: (file: File) => void) {
  const [
    openFileSelector,
    {
      plainFiles: [file]
    }
  ] = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['image/*']
  });

  useEffect(() => {
    if (!file) {
      return;
    }

    onReplaceImageFile(file);
  }, [file]);

  return openFileSelector;
}

export default function GuiPanelTextureMenu({
  textureIndex,
  width,
  height,
  pixelsObjectUrls,
  onReplaceImageFile
}: {
  textureIndex: number;
  width: number;
  height: number;
  pixelsObjectUrls: SourceTextureData;
  onReplaceImageFile: (file: File) => void;
}) {
  const dispatch = useAppDispatch();
  const openFileSelector = useTextureReplacementPicker(onReplaceImageFile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const textureHistory = useAppSelector(
    (s) => s.modelData.textureHistory[textureIndex]
  );

  const options = useMemo<
    { label: JSX.Element | string; tooltip: string; onClick: () => void }[]
  >(
    () => [
      {
        label: (
          <>
            <Icon path={mdiFileDownload} size={1} />
            Download{dlAsTranslucent ? ' (T)' : ' (O)'}
          </>
        ),
        tooltip: `Download texture as a PNG [${
          dlAsTranslucent ? 'translucent' : 'opaque'
        }]. Press 'T' key to toggle translucency.`,
        onClick: async () => {
          const bufferUrl =
            (!dlAsTranslucent
              ? pixelsObjectUrls.opaque || pixelsObjectUrls.translucent
              : pixelsObjectUrls.translucent) || '';
          const a = document.createElement('a');

          const pixels = new Uint8ClampedArray(
            await objectUrlToBuffer(bufferUrl)
          );
          new Jimp.read(
            { data: pixels, width, height },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (_: Error, image: typeof Jimp) => {
              image.getBase64Async(Jimp.MIME_PNG).then((base64: string) => {
                a.download = `modnao-texture-${textureIndex}.png`;
                a.href = base64;
                a.click();
                handleClose();
              });
            }
          );
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
          'Replace this texture with another image file.' +
          'Special zero-alpha pixels will be auto re-applied ' +
          'once you have imported the image and zoomed/cropped/rotated it.',
        onClick() {
          openFileSelector();
          handleClose();
        }
      },
      ...(!textureHistory?.length
        ? []
        : [
            {
              label: (
                <>
                  <Icon path={mdiFileUndo} size={1} />
                  Undo Replace
                </>
              ),
              tooltip: 'Undo a previously replaced texture operation',
              onClick() {
                if (textureHistory?.length) {
                  dispatch(revertTextureImage({ textureIndex }));
                }
                handleClose();
              }
            }
          ])
    ],
    [
      pixelsObjectUrls,
      dlAsTranslucent,
      textureIndex,
      textureHistory,
      openFileSelector,
      handleClose
    ]
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
          <Tooltip title={option.tooltip} key={i} placement='left'>
            <MenuItem onClick={option.onClick}>{option.label}</MenuItem>
          </Tooltip>
        ))}
        <Divider />
        <GuiPanelTextureHSLOptions textureIndex={textureIndex} />
      </StyledMenu>
    </StyledMenuButtonContainer>
  );
}
