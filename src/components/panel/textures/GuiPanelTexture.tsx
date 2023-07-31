import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Typography, styled } from '@mui/material';
import Image from 'next/image';
import { TextureSize } from '@/utils/textures/TextureSize';
import { NLTextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import {
  replaceTextureDataUrl,
  selectIsMeshOpaque,
  useAppDispatch
} from '@/store';
import { useCallback } from 'react';
import loadDataUrlFromImageFile from '@/utils/images/loadDataUrlFromImageFile';
import { useDropzone } from 'react-dropzone';

const StyledPanelTexture = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      background-color: ${theme.palette.panelTexture.background};
  }
      
  & .image-area {
    position: relative;
    display: flex;
    width: 100%;
  }

  & .image-area.active:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: ${theme.palette.secondary.light};
    border: 3px solid ${theme.palette.secondary.main};
    mix-blend-mode: hard-light;
    opacity: 0.75;
    pointer-events: none;
  }

  & .image-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
    
  & img {
    width: 100%;
    height: auto;
    border-color: transparent;
    border-width: 3px;
    border-style: solid;
    opacity: 1.0;
    transform: rotate(-90deg);
  }

  & .selected img {
    border-color: ${theme.palette.primary.main};
  }

  & .size-notation {
    position: absolute;
    right: ${theme.spacing(1)};
    bottom: ${theme.spacing(1)};
    color: ${theme.palette.primary.contrastText};
    text-shadow: 1px 1px 1px black;
    filter: drop-shadow(3px 3px 1px black);
  }
  `
);

export type GuiPanelTextureProps = {
  selected: boolean;
  textureDef: NLTextureDef;
  textureSize: TextureSize;
  textureIndex: number;
};

// @TODO: calculate which dataUrl to show (opaque vs transparent) in parent
// so that all textures don't include a selector to run on renders

export default function GuiPanelTexture({
  selected,
  textureIndex,
  textureDef,
  textureSize
}: GuiPanelTextureProps) {
  const dispatch = useAppDispatch();
  const onSelectNewImageFile = useCallback(
    (dataUrl: string) => {
      dispatch(replaceTextureDataUrl({ dataUrl, textureIndex }));
    },
    [textureIndex]
  );

  const isSelectedMeshOpaque = useSelector(selectIsMeshOpaque);

  const onDrop = useCallback(
    async ([file]: File[]) => {
      const dataUrl = await loadDataUrlFromImageFile(file);
      onSelectNewImageFile(dataUrl);
    },
    [onSelectNewImageFile]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      'image/bmp': ['.bmp'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif']
    }
  });
  const [width, height] = textureSize;

  // always take actions on translucent texture if possible */
  const actionableDataUrl =
    textureDef.dataUrls.translucent || textureDef.dataUrls.opaque || '';

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable dataUrl
  const displayedDataUrl =
    (selected && isSelectedMeshOpaque
      ? textureDef.dataUrls.opaque || textureDef.dataUrls.translucent
      : actionableDataUrl) || '';

  return (
    <StyledPanelTexture>
      <div
        className={clsx(
          'image-area',
          selected && 'selected',
          isDragActive && 'active'
        )}
        {...getRootProps()}
      >
        <Image
          src={displayedDataUrl}
          id={`gui-panel-t-${textureIndex}`}
          alt={`Texture # ${textureIndex}`}
          width={Number(width)}
          height={Number(height)}
        />
        <Typography
          variant='subtitle2'
          textAlign='right'
          className={'size-notation'}
        >
          {textureSize[0]}x{textureSize[0]} [{textureIndex}]
        </Typography>
        <GuiPanelTextureMenu
          textureIndex={textureIndex}
          dataUrl={actionableDataUrl}
          onReplaceImageFile={onSelectNewImageFile}
        />
      </div>
    </StyledPanelTexture>
  );
}
