import clsx from 'clsx';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ButtonBase, Skeleton, styled, Tooltip } from '@mui/material';
import { NLUITextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import {
  selectMesh,
  setObjectViewedIndex,
  useAppDispatch,
  useAppSelector
} from '@/store';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import ContentViewMode from '@/types/ContentViewMode';
import themeMixins from '@/theming/themeMixins';
import { useTextureReplaceDropzone } from '@/hooks';
import ImageBufferCanvas from '@/components/ImageBufferCanvas';
import globalBuffers from '@/utils/data/globalBuffers';
import { uvToClipPathPoint } from '@/utils/textures';

const IMG_SIZE = '174px';

const StyledPanelTexture = styled('div')(
  ({ theme }) =>
    `
  & {
      position: relative;
      display: inline-flex;
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
    ${themeMixins.fileDragActiveAfter(theme)}
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

  &.mode-textures.selectable {
    cursor: pointer;
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

  .uv-overlay canvas {
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
    user-select: none;
  }
  `
);

export type GuiPanelTextureProps =
  | {
      selected: boolean;
      textureDef: NLUITextureDef;
      textureIndex: number;
      polygonIndex: number;
      contentViewMode: ContentViewMode;
    }
  | {
      selected: undefined;
      textureDef: undefined;
      textureIndex: undefined;
      polygonIndex: undefined;
      contentViewMode: undefined;
    };
type ClipPath = { x: number; y: number }[];

export default function GuiPanelTexture(props: GuiPanelTextureProps) {
  const {
    selected,
    textureDef,
    textureIndex = -1,
    polygonIndex = -1,
    contentViewMode = 'textures'
  } = props;
  const dispatch = useAppDispatch();
  const mesh = useAppSelector(selectMesh);
  const viewOptions = useContext(ViewOptionsContext);

  const uvClipPaths = useMemo<ClipPath[]>(() => {
    if (
      !(selected && mesh?.polygons.length) ||
      contentViewMode !== 'polygons'
    ) {
      return [];
    }

    const paths: ClipPath[] = [];

    const polygons =
      polygonIndex !== -1 ? [mesh.polygons[polygonIndex]] : mesh.polygons;

    for (let pIndex = 0; pIndex < polygons.length; pIndex++) {
      const p = polygons[pIndex];
      for (let i = 0; i < p.triIndices.length; i += 4) {
        const path: ClipPath = [];
        for (let j = i; j < i + 4; j++) {
          const { uv } = p.vertices[p.triIndices[j]];

          path.push(
            uvToClipPathPoint(
              uv,
              textureDef.width,
              textureDef.height,
              mesh.textureWrappingFlags
            )
          );
        }
        paths.push(path);
      }
    }

    return paths;
  }, [
    selected && mesh?.polygons,
    selected && mesh?.textureWrappingFlags,
    polygonIndex,
    contentViewMode !== 'polygons'
  ]);

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const { width = 0, height = 0 } = textureDef || {};

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable buffer
  const imageBufferKey =
    (selected && mesh?.isOpaque
      ? textureDef?.bufferKeys?.opaque || textureDef?.bufferKeys?.translucent
      : textureDef?.bufferKeys?.translucent ||
        textureDef?.bufferKeys?.opaque) || '';

  const rgbaBuffer = useMemo(
    () =>
      imageBufferKey ? globalBuffers.get(imageBufferKey) : new Uint8Array(0),
    [imageBufferKey]
  );

  const [srcTextureBitmap, setSrcTextureBitmap] = useState<null | ImageBitmap>(
    null
  );

  useEffect(() => {
    (async () => {
      if (!rgbaBuffer?.length || !width || !height) {
        return;
      }
      const imageData = new ImageData(
        new Uint8ClampedArray(rgbaBuffer),
        width,
        height
      );
      const bitmap = await createImageBitmap(imageData);
      setSrcTextureBitmap(bitmap);
    })();
  }, [rgbaBuffer]);

  const imgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const draw = () => {
      const canvas = imgCanvasRef.current;
      if (canvas && srcTextureBitmap) {
        const context = canvas.getContext('2d');
        if (context) {
          const showUvArea = contentViewMode !== 'textures' && selected;
          context.clearRect(0, 0, width, height);
          context.globalAlpha = showUvArea ? 0.25 : 1;
          context.filter = `saturate(${showUvArea ? '0' : '1'})`;
          context.drawImage(srcTextureBitmap, 0, 0);

          if (!showUvArea) {
            return;
          }

          context.globalAlpha = 1;
          context.filter = 'saturate(1)';

          context.save();

          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((90 * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          context.beginPath();
          uvClipPaths.forEach((points) => {
            if (points.length > 0) {
              context.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y);
              }
            }
          });
          context.closePath();
          context.clip();

          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((-90 * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          context.drawImage(srcTextureBitmap, 0, 0);
          context.restore();
        }
      }
    };

    requestAnimationFrame(draw);
  }, [srcTextureBitmap, uvClipPaths, selected, contentViewMode]);

  const isSelectable = contentViewMode === 'textures' && !selected;

  const mainContentProps = useMemo(
    () => ({
      id: `gui-panel-t-${textureIndex}`,
      className: clsx(
        'image-area',
        selected && 'selected',
        isDragActive && 'file-drag-active',
        viewOptions.uvRegionsHighlighted
      ),
      ...getDragProps(),
      ...(!isSelectable
        ? {}
        : {
            onClick: () => dispatch(setObjectViewedIndex(textureIndex)),
            tabIndex: 0
          })
    }),
    [
      isDragActive,
      viewOptions.uvRegionsHighlighted,
      selected,
      textureIndex,
      isSelectable
    ]
  );

  if (!imageBufferKey) {
    return (
      <StyledPanelTexture
        className={clsx(
          `mode-${contentViewMode}`,
          isSelectable && 'selectable'
        )}
      >
        <Skeleton
          variant='rectangular'
          height={170}
          width='100%'
          className='img'
        />
      </StyledPanelTexture>
    );
  }

  const content = (
    <ImageBufferCanvas
      rgbaBuffer={!rgbaBuffer?.length ? rgbaBuffer : undefined}
      ref={rgbaBuffer?.length && uvClipPaths ? imgCanvasRef : undefined}
      width={width}
      height={height}
      alt={`Texture # ${textureIndex}`}
      className='img'
    />
  );

  return (
    <StyledPanelTexture
      className={clsx(
        `mode-${contentViewMode}`,
        isSelectable && 'selectable',
        viewOptions.uvRegionsHighlighted && 'uvs-enabled'
      )}
    >
      {!isSelectable ? (
        <div {...mainContentProps}>{content}</div>
      ) : (
        <Tooltip title='Select this texture'>
          <ButtonBase {...mainContentProps}>{content}</ButtonBase>
        </Tooltip>
      )}
      {textureDef ? (
        <GuiPanelTextureMenu
          textureIndex={textureIndex}
          pixelBufferKeys={textureDef.bufferKeys}
          onReplaceImageFile={onSelectNewImageFile}
        />
      ) : undefined}
    </StyledPanelTexture>
  );
}
