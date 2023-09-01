import { useCallback, useContext, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import Img from 'next/image';
import { Skeleton, styled, Typography } from '@mui/material';
import { NLTextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import { selectMesh, useAppDispatch, useAppSelector } from '@/store';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import { selectReplacementTexture } from '@/store/replaceTextureSlice';
import uvToCssPathPoint from '@/utils/textures/uvToCssPathPoint';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

const IMG_SIZE = '174px';

const StyledPanelTexture = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: ${IMG_SIZE};
      background-color: ${theme.palette.panelTexture.background};
  }
      
  & .image-area {
    position: relative;
    display: flex;
    width: 100%;
  }

  & .image-area.file-drag-active:after {
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
    
  & .img {
    width: ${IMG_SIZE};
    height: ${IMG_SIZE};
    border-color: transparent;
    border-width: 3px;
    border-style: solid;
    opacity: 1.0;
    transform: rotate(-90deg);
  }

  & .selected:after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: '';
    border-width: 3px;
    border-style: solid;
    border-color: ${theme.palette.primary.main};
    pointer-events: none;
  }

  &.uvs-enabled .selected .img {
    filter: saturate(0);
    opacity: 0.25;
  }

  .uv-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: ${IMG_SIZE};
    height: ${IMG_SIZE};
    border: 3px solid transparent;
    pointer-events: none;
  }

  .uv-overlay img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transform: rotate(-90deg);
    pointer-events: none;
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
  polygonIndex: number;
};

export default function GuiPanelTexture({
  selected,
  textureIndex,
  textureDef,
  polygonIndex
}: GuiPanelTextureProps) {
  const dispatch = useAppDispatch();
  const mesh = useAppSelector(selectMesh);
  const viewOptions = useContext(ViewOptionsContext);

  const uvClipPaths = useMemo<string[]>(() => {
    if (!(selected && mesh?.polygons.length)) {
      return [];
    }

    const paths: string[] = [];

    const polygons =
      polygonIndex !== -1 ? [mesh.polygons[polygonIndex]] : mesh.polygons;

    polygons.forEach((p) => {
      for (let i = 0; i < p.triIndices.length; i += 4) {
        let path = '';
        [i, i + 1, i + 2, i + 3].forEach((j, jI, triPoints) => {
          const { uv } = p.vertices[p.triIndices[j]];

          path +=
            uvToCssPathPoint(uv) + (jI === triPoints.length - 1 ? '' : ', ');
        });

        paths.push(path);
      }
    });

    return paths;
  }, [selected && mesh?.polygons, polygonIndex]);

  const onSelectNewImageFile = useCallback(
    async (imageFile: File) => {
      dispatch(
        selectReplacementTexture({
          imageFile,
          textureIndex
        })
      );
    },
    [textureIndex, textureDef.bufferUrls.translucent]
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

  const { width, height } = textureDef;

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable dataUrl
  const imageDataUrl =
    (selected && mesh?.isOpaque
      ? textureDef.dataUrls.opaque || textureDef.dataUrls.translucent
      : textureDef.dataUrls.translucent || textureDef.dataUrls.opaque) || '';

  const uvOverlays = useMemo(
    () =>
      !viewOptions.uvRegionsHighlighted || !uvClipPaths.length ? undefined : (
        <>
          {uvClipPaths.map((path: string, i) => (
            <div
              className='uv-overlay'
              key={`${textureIndex}_${i}`}
              style={{ clipPath: `polygon(${path})` }}
            >
              <Img
                src={imageDataUrl}
                width={width}
                height={height}
                className='uv-highlight'
                alt='UV Highlight'
              />
            </div>
          ))}
        </>
      ),
    [uvClipPaths, imageDataUrl, width, height, viewOptions.uvRegionsHighlighted]
  );

  return (
    <StyledPanelTexture
      className={clsx(viewOptions.uvRegionsHighlighted && 'uvs-enabled')}
    >
      <div
        id={`gui-panel-t-${textureIndex}`}
        className={clsx(
          'image-area',
          selected && 'selected',
          isDragActive && 'file-drag-active',
          viewOptions.uvRegionsHighlighted
        )}
        {...getDragProps()}
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
        {uvOverlays}
        <Typography
          variant='subtitle2'
          textAlign='right'
          className='size-notation'
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
