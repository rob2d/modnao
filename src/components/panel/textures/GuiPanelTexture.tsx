import clsx from 'clsx';
import { useSelector } from 'react-redux';
import 'jimp';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { styled, Typography } from '@mui/material';
import { NLTextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import {
  replaceTextureDataWithImageUrl,
  selectIsMeshOpaque,
  useAppDispatch
} from '@/store';
import { useCallback, useEffect, useState } from 'react';
import loadDataUrlFromImageFile from '@/utils/images/loadDataUrlFromImageFile';
import { objectUrlToBuffer } from '@/utils/data';

const { Jimp } = globalThis as any;

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
  const onSelectNewImageFile = useCallback(
    (url: string) =>
      dispatch(replaceTextureDataWithImageUrl({ url, textureIndex })),
    [textureIndex]
  );

  const isSelectedMeshOpaque = useSelector(selectIsMeshOpaque);

  const onDrop = useCallback(
    async ([file]: File[]) => {
      onSelectNewImageFile(await loadDataUrlFromImageFile(file));
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

  const [imgSrc, setImgSrc] = useState<string>('');

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable dataUrl
  const pixelDataUrl =
    (selected && isSelectedMeshOpaque
      ? textureDef.bufferUrls.opaque || textureDef.bufferUrls.translucent
      : textureDef.bufferUrls.translucent || textureDef.bufferUrls.opaque) ||
    '';

  useEffect(() => {
    (async () => {
      const pixels = new Uint8ClampedArray(
        await objectUrlToBuffer(pixelDataUrl)
      );

      new Jimp.read({ data: pixels, width, height }, (_: Error, image: any) => {
        image.getBase64Async(Jimp.MIME_PNG).then((base64: string) => {
          setImgSrc(base64);
        });
      });
    })();
  }, [pixelDataUrl]);

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
        {!imgSrc ? (
          <div className='img' />
        ) : (
          <Image
            src={imgSrc}
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
          pixelsObjectUrl={
            textureDef.bufferUrls.opaque ||
            textureDef.bufferUrls.translucent ||
            ''
          }
          onReplaceImageFile={onSelectNewImageFile}
        />
      </div>
    </StyledPanelTexture>
  );
}
