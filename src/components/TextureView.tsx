import { IconButton, Skeleton, styled } from '@mui/material';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Img from 'next/image';
import useViewportSizes from 'use-viewport-sizes';
import { useObjectNavControls, useObjectUINav } from '@/hooks';
import {
  selectTextureIndex,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import clsx from 'clsx';
import themeMixins from '@/theming/themeMixins';
import { selectReplacementTexture } from '@/store/replaceTextureSlice';

const Styled = styled('div')(
  ({ theme }) =>
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
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    & .texture-preview > div {
      transform: rotate(-90deg);
    }

    & .texture-preview > * {
      position: relative;
    }
    
    & .texture-preview > div.file-drag-active:after {
      ${themeMixins.fileDragActiveAfter(theme)}
    }`
);

export default function TextureView() {
  useObjectNavControls();
  const dispatch = useAppDispatch();
  const uiControls = useObjectUINav();
  const [vpW] = useViewportSizes();
  const size = Math.round((vpW - 222) * 0.66);
  const textureIndex = useAppSelector(selectTextureIndex);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);

  // @TODO: DRY w GuiPanelTexture
  const onSelectNewImageFile = useCallback(
    async (imageFile: File) => {
      dispatch(selectReplacementTexture({ imageFile, textureIndex }));
    },
    [textureIndex]
  );

  const onDrop = useCallback(
    async ([file]: File[]) => {
      onSelectNewImageFile(file);
    },
    [onSelectNewImageFile]
  );

  const { getRootProps: getDragProps, isDragActive } = useDropzone({
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
        <div className='texture-preview' {...getDragProps()}>
          {!textureUrl ? (
            <Skeleton variant='rectangular' width={size} height={size} />
          ) : (
            <div className={clsx(isDragActive && 'file-drag-active')}>
              <Img
                alt='texture preview'
                width={size}
                height={size}
                src={textureUrl}
              />
            </div>
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
