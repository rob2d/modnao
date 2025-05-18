import clsx from 'clsx';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Skeleton,
  styled,
  Typography
} from '@mui/material';
import {
  mdiAspectRatio,
  mdiMenuLeftOutline,
  mdiMenuRightOutline,
  mdiStretchToPageOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import useViewportSizes from 'use-viewport-sizes';
import {
  useObjectNavControls,
  useObjectUINav,
  useTextureOptions,
  useTextureReplaceDropzone
} from '@/hooks';
import {
  selectResourceAttribs,
  selectTextureIndex,
  selectUpdatedTextureDefs,
  useAppSelector
} from '@/store';
import themeMixins from '@/theming/themeMixins';
import TextureColorOptions from './TextureColorOptions';
import { TextureImageBufferKeys } from '@/utils/textures';
import { useMemo, useState } from 'react';
import globalBuffers from '@/utils/data/globalBuffers';
import ImageBufferCanvas from './ImageBufferCanvas';
import { useSelector } from 'react-redux';

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
      width: 100%;
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

      width: var(--size);
      height: var(--size);
    }
    
    & .texture-preview > div {
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-90deg);
    }

    & .texture-preview-canvas {
      width: var(--size);
      height: var(--size);
    }

    & .game-aspect-ratio .texture-preview-canvas {
      height: calc(var(--size) * var(--aspect-ratio));
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
  const resourceAttribs = useSelector(selectResourceAttribs);
  const hasAspectRatio =
    typeof resourceAttribs?.textureShapesMap?.[textureIndex]
      .displayedAspectRatio === 'number';

  /** @TODO: create persistent setting */
  const [viewInGameRatio, setViewInGameRatio] = useState(true);

  const { isDragActive, getDragProps, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const bufferKeys = textureDefs?.[textureIndex]
    ?.bufferKeys as TextureImageBufferKeys;

  const options = useTextureOptions(
    textureIndex,
    bufferKeys,
    onSelectNewImageFile as (file: File | SharedArrayBuffer) => void,
    () => {},
    false
  );

  const textureBufferKey = textureDefs?.[textureIndex]?.bufferKeys?.opaque;
  const textureBuffer = useMemo(
    () =>
      textureBufferKey
        ? globalBuffers.get(textureBufferKey)
        : new Uint8Array(0),
    [textureBufferKey]
  );

  const textureAspectRatioSelection = useMemo(() => {
    if (!hasAspectRatio) {
      return undefined;
    }

    return (
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: theme.spacing(1),
          right: theme.spacing(2)
        })}
      >
        <ButtonGroup>
          <Button
            color='secondary'
            disabled={viewInGameRatio}
            onClick={() => setViewInGameRatio(true)}
          >
            <Icon path={mdiAspectRatio} size={1} />
          </Button>
          <Button
            color='secondary'
            disabled={!viewInGameRatio}
            onClick={() => setViewInGameRatio(false)}
          >
            <Icon path={mdiStretchToPageOutline} size={1} />
          </Button>
        </ButtonGroup>
      </Box>
    );
  }, [viewInGameRatio, textureIndex, hasAspectRatio]);

  return (
    <Styled>
      <div className='main'>
        {textureAspectRatioSelection}
        <div className='model-nav-button'>
          <IconButton color='primary' {...uiControls.prevButtonProps}>
            <Icon path={mdiMenuLeftOutline} size={2} />
          </IconButton>
        </div>
        <div className='center-section'>
          <div
            className={clsx(
              'texture-preview',
              viewInGameRatio && hasAspectRatio && 'game-aspect-ratio'
            )}
            {...getDragProps()}
            style={
              {
                '--size': `${size}px`,
                '--aspect-ratio':
                  resourceAttribs?.textureShapesMap?.[textureIndex]
                    ?.displayedAspectRatio
              } as React.CSSProperties
            }
          >
            {!textureBufferKey ? (
              <Skeleton variant='rectangular' width={size} height={size} />
            ) : (
              <div className={clsx(isDragActive && 'file-drag-active')}>
                <ImageBufferCanvas
                  alt='texture preview'
                  width={textureDefs[textureIndex].width}
                  height={textureDefs[textureIndex].height}
                  rgbaBuffer={textureBuffer}
                  className='texture-preview-canvas'
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
