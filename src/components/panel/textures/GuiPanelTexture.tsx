import clsx from 'clsx';
import { useSelector } from 'react-redux';
import Img from 'next/image';
import { Image } from 'image-js';
import { useDropzone } from 'react-dropzone';
import { Skeleton, styled, Typography } from '@mui/material';
import { NLTextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import {
  replaceTextureImage,
  selectIsMeshOpaque,
  useAppDispatch
} from '@/store';
import { useCallback, useEffect } from 'react';
import { bufferToObjectUrl, objectUrlToBuffer } from '@/utils/data';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import { selectReplacementTexture } from '@/store/replaceTextureSlice';

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
    
  & .img {
    width: 100%;
    height: auto;
    border-color: transparent;
    border-width: 3px;
    border-style: solid;
    opacity: 1.0;
    transform: rotate(-90deg);
  }

  & .selected .img {
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
  textureIndex: number;
};

export default function GuiPanelTexture({
  selected,
  textureIndex,
  textureDef
}: GuiPanelTextureProps) {
  const dispatch = useAppDispatch();
  const isSelectedMeshOpaque = useSelector(selectIsMeshOpaque);

  const onSelectNewImageFile = useCallback(
    async (imageFile: File) => {
      dispatch(
        selectReplacementTexture({
          imageFile,
          textureIndex
        })
      );
      /*
      const oTranslucentBuffer = new Uint8ClampedArray(
        await objectUrlToBuffer(textureDef.bufferUrls.translucent || '')
      );

      const [translucentBuffer, opaqueBuffer] = await loadRGBABuffersFromFile(
        file
      );

      // restore original RGBA values on translucent for special cases
      // where alpha was zero
      for (let i = 0; i < oTranslucentBuffer.length; i += 4) {
        if (oTranslucentBuffer[i + 3] === 0) {
          translucentBuffer[i + 3] = 0;
        }
      }

      const [translucent, opaque] = await Promise.all([
        bufferToObjectUrl(translucentBuffer),
        bufferToObjectUrl(opaqueBuffer)
      ]);

      const bufferUrls = { translucent, opaque };

      dispatch(
        replaceTextureImage({
          textureIndex,
          bufferUrls,
          dataUrls: {
            translucent: new Image({
              data: translucentBuffer,
              width,
              height
            }).toDataURL(),
            opaque: new Image({
              data: opaqueBuffer,
              width,
              height
            }).toDataURL()
          }
        })
      );
      */
    },
    [textureIndex, textureDef.bufferUrls.translucent]
  );

  const onDrop = useCallback(
    async ([file]: File[]) => {
      onSelectNewImageFile(file);
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

  const { width, height } = textureDef;

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable dataUrl
  const imageDataUrl =
    (selected && isSelectedMeshOpaque
      ? textureDef.dataUrls.opaque || textureDef.dataUrls.translucent
      : textureDef.dataUrls.translucent || textureDef.dataUrls.opaque) || '';

  return (
    <StyledPanelTexture>
      <div
        id={`gui-panel-t-${textureIndex}`}
        className={clsx(
          'image-area',
          selected && 'selected',
          isDragActive && 'active'
        )}
        {...getRootProps()}
      >
        {!imageDataUrl ? (
          <Skeleton variant='rectangular' height={170} width='100%' />
        ) : (
          <Img
            src={imageDataUrl}
            width={width}
            height={height}
            alt={`Texture # ${textureIndex}`}
            className='img'
          />
        )}
        <Typography
          variant='subtitle2'
          textAlign='right'
          className={'size-notation'}
        >
          {textureDef.width}x{textureDef.height} [{textureIndex}]
        </Typography>
        <GuiPanelTextureMenu
          textureIndex={textureIndex}
          width={textureDef.width}
          height={textureDef.height}
          pixelsObjectUrls={textureDef.bufferUrls as SourceTextureData}
          onReplaceImageFile={onSelectNewImageFile}
        />
      </div>
    </StyledPanelTexture>
  );
}
