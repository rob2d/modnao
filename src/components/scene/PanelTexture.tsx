import { TextureSize } from '@/store/stage-data/process-stage-polygon-file/TextureSize';
import { NLTextureDef } from '@/types/NLAbstractions';
import { Typography, styled } from '@mui/material';
import clsx from 'clsx';
import Image from 'next/image';

type PanelTextureProps = {
  isDeemphasized: boolean;
  textureDef: NLTextureDef;
  textureSize: TextureSize;
  textureIndex: number;
};

const StyledPanelTexture = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      flex-direction: column;
      width: 100%;
  }

  & .MuiTypography-root.deemphasized {
    opacity: 0.5;
  }
      
  & .image-area {
    position: relative;
    width: 100%;
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
    border-color: ${theme.palette.secondary.main};
    border-width: 1px;
    border-style: solid;
    opacity: 1.0;
    transition: opacity 0.35s ease;
  }

  & img.deemphasized {
    filter: saturate(0.5);
    opacity: 0.25;
  }

  & .size-notation {
    position: absolute;
    right: ${theme.spacing(1)};
    bottom: 0;
    text-shadow: 1px 1px 1px white;
  }

  & .size-notation:not(.deemphasized) {
    filter: invert(1);
  }
  `
);

export default function PanelTexture({
  isDeemphasized,
  textureIndex,
  textureDef,
  textureSize
}: PanelTextureProps) {
  const [width, height] = textureSize;
  const dataUrl =
    textureDef.dataUrls.translucent || textureDef.dataUrls.opaque || '';

  const deemphasizedClass = clsx(isDeemphasized && 'deemphasized');

  return (
    <StyledPanelTexture>
      <div className='image-area'>
        <Image
          src={dataUrl}
          id={`debug-panel-t-${textureIndex}`}
          alt={`Texture # ${textureIndex}`}
          width={Number(width)}
          height={Number(height)}
          className={deemphasizedClass}
        />
        <Typography
          variant='subtitle2'
          textAlign='right'
          className={clsx(deemphasizedClass, 'size-notation')}
        >
          {textureSize[0]}x{textureSize[0]} [index: {textureIndex}]
        </Typography>
      </div>
    </StyledPanelTexture>
  );
}
