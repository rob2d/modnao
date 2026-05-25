import clsx from 'clsx';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Skeleton,
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
import { useObjectNavControls, useObjectUINav } from '@/modules/object-viewer';
import { TextureColorOptions, useTextureOptions } from '@/modules/model-data';
import { useTextureReplaceDropzone } from '@/modules/replace-texture';
import {
  selectResourceAttribs,
  selectTextureIndex,
  selectUpdatedTextureDefs
} from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import { TextureImageBufferKeys } from '@/utils/textures';
import { useMemo, useState } from 'react';
import globalBuffers from '@/utils/data/globalBuffers';
import ImageBufferCanvas from './ImageBufferCanvas';
import { useSelector } from 'react-redux';

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
        sx={{
          position: 'absolute',
          top: 'var(--mui-spacing)',
          right: 'calc(var(--mui-spacing) * 2)'
        }}
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
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: '100vh',
        '& .main': {
          display: 'grid',
          flexGrow: 1,
          width: '100%',
          gridTemplateColumns: 'min-content auto min-content'
        },
        '& .main > *': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        '& .controls-panel': {
          display: 'flex',
          flexShrink: 0
        },
        '& .center-section': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxHeight: '100%'
        },
        '& .texture-controls': {
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        },
        '& .texture-controls > *, & .texture-controls > * > ul': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' }
        },
        '& .texture-controls > * > *, & .texture-controls > * > ul > *': {
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        },
        '& .texture-preview': {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--size)',
          height: 'var(--size)'
        },
        '& .texture-preview > div': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-90deg)'
        },
        '& .texture-preview-canvas': {
          width: 'var(--size)',
          height: 'var(--size)'
        },
        '& .game-aspect-ratio .texture-preview-canvas': {
          height: 'calc(var(--size) * var(--aspect-ratio))'
        },
        '& .texture-preview > *': {
          position: 'relative'
        },
        '& .texture-preview > div.file-drag-active:after':
          theme.mixins.fileDragActiveAfter
      })}
    >
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
    </Box>
  );
}
