import clsx from 'clsx';
import {
  Divider,
  IconButton,
  Skeleton,
  styled,
  Typography
} from '@mui/material';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Img from 'next/image';
import useViewportSizes from 'use-viewport-sizes';
import {
  useObjectNavControls,
  useObjectUINav,
  useTextureOptions,
  useTextureReplaceDropzone
} from '@/hooks';
import {
  selectTextureIndex,
  selectUpdatedTextureDefs,
  useAppSelector
} from '@/store';
import themeMixins from '@/theming/themeMixins';
import TextureColorOptions from './TextureColorOptions';
import { SourceTextureData } from '@/utils/textures';

const Styled = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      max-height:100vh;
    }

    & .main {
      display: grid;
      flex-grow: 1;
      grid-template-columns: min-content auto min-content;
    }

    & .main > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & .controls-panel {
      display: flex;
      flex-shrink: 0;
    }

    & .center-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-height:100%;
    }

    & .texture-controls {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    & .texture-controls > *, .texture-controls > * > ul {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    ${theme.breakpoints.down('md')} {
      & .texture-controls > *, .texture-controls > * > ul {
        flex-direction: column;
      }
    }

    & .texture-controls > * > *, .texture-controls > * > ul > * {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    & .texture-preview {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    & .texture-preview > div {
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-90deg);
    }

    & .texture-preview > * {
      position: relative;
    }
    
    & .texture-preview > div.file-drag-active:after {
      ${themeMixins.fileDragActiveAfter(theme)}
    }`
);

function TextureViewControlsButton({
  onClick,
  iconPath,
  label,
  disabled = false
}: {
  onClick: () => void;
  iconPath: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <IconButton color='primary' onClick={onClick} disabled={disabled}>
        <Icon path={iconPath} size={1} />
        <Typography variant='button'>{label}</Typography>
      </IconButton>
    </div>
  );
}

export default function TextureView() {
  useObjectNavControls();
  const uiControls = useObjectUINav();
  const [vpW, vpH] = useViewportSizes();
  const size = Math.min(Math.round((vpW - 222) * 0.5), Math.round(vpH - 96));
  const textureIndex = useAppSelector(selectTextureIndex);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);

  const { isDragActive, getDragProps, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const textureUrl = textureDefs?.[textureIndex]?.dataUrls?.opaque;
  const bufferUrls = textureDefs?.[textureIndex]
    ?.bufferUrls as SourceTextureData;

  const options = useTextureOptions(
    textureIndex,
    bufferUrls,
    onSelectNewImageFile as (file: File) => void,
    () => {},
    false
  );

  return (
    <Styled>
      <div className='main'>
        <div className='model-nav-button'>
          <IconButton color='primary' {...uiControls.prevButtonProps}>
            <Icon path={mdiMenuLeftOutline} size={2} />
          </IconButton>
        </div>
        <div className='center-section'>
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
          <div className='texture-controls'>
            <div>
              <TextureColorOptions
                textureIndex={textureIndex}
                variant='texture-view'
              />
            </div>
            <Divider flexItem />
            <div>
              {options.map((o) => (
                <TextureViewControlsButton key={o.label} {...o} />
              ))}
            </div>
          </div>
        </div>
        <div className='model-nav-button'>
          <IconButton color='primary' {...uiControls.nextButtonProps}>
            <Icon path={mdiMenuRightOutline} size={2} />
          </IconButton>
        </div>
      </div>
      <div className='controls-panel'></div>
    </Styled>
  );
}
