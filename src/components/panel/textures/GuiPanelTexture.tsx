import { TextureSize } from '@/utils/textures/TextureSize';
import { NLTextureDef } from '@/types/NLAbstractions';
import { Typography, styled } from '@mui/material';
import clsx from 'clsx';
import Image from 'next/image';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import { useSelector } from 'react-redux';
import { selectIsMeshOpaque } from '@/store';

const StyledPanelTexture = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: ${theme.palette.panelTexture.background};
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
    border-color: transparent;
    border-width: 3px;
    border-style: solid;
    opacity: 1.0;
  }

  & .selected img {
    border-color: ${theme.palette.primary.main};
  }

  & .size-notation {
    position: absolute;
    right: ${theme.spacing(1)};
    bottom: ${theme.spacing(2)};
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
  const isSelectedMeshOpaque = useSelector(selectIsMeshOpaque);
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
      <div className={clsx(selected && 'selected', 'image-area')}>
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
        />
      </div>
    </StyledPanelTexture>
  );
}
