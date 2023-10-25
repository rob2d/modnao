import { IconButton, Skeleton, styled } from '@mui/material';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Img from 'next/image';
import useViewportSizes from 'use-viewport-sizes';
import { useObjectNavControls, useObjectUINav } from '@/hooks';
import {
  selectTextureIndex,
  selectUpdatedTextureDefs,
  useAppSelector
} from '@/store';

const Styled = styled('div')(
  () =>
    `& {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      max-height:100vh;
      overflow-y: hidden;
    }

    & .main-preview {
      display: grid;
      flex-grow: 1;
      grid-template-columns: min-content auto min-content;
    }

    & .main-preview > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & .controls-panel {
      display: flex;
      flex-shrink: 0;
    }

    & .texture-preview {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    & .texture-preview > img {
      transform: rotate(-90deg);
    }`
);

export default function TextureView() {
  useObjectNavControls();
  const uiControls = useObjectUINav();
  const [vpW] = useViewportSizes();
  const size = Math.round((vpW - 222) * 0.66);
  const textureIndex = useAppSelector(selectTextureIndex);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const textureUrl = textureDefs?.[textureIndex]?.dataUrls?.opaque;

  return (
    <Styled>
      <div className='main-preview'>
        <IconButton
          className='model-nav-button'
          color='primary'
          aria-haspopup='true'
          {...uiControls.prevButtonProps}
        >
          <Icon path={mdiMenuLeftOutline} size={2} />
        </IconButton>
        <div className='texture-preview'>
          {!textureUrl ? (
            <Skeleton
              className='texture-preview'
              variant='rectangular'
              width={size}
              height={size}
            />
          ) : (
            <Img
              alt='texture preview'
              className='texture-preview'
              width={size}
              height={size}
              src={textureUrl}
            />
          )}
        </div>
        <IconButton
          className='model-nav-button'
          color='primary'
          aria-haspopup='true'
          {...uiControls.nextButtonProps}
        >
          <Icon path={mdiMenuRightOutline} size={2} />
        </IconButton>
      </div>
      <div className='controls-panel'></div>
    </Styled>
  );
}
