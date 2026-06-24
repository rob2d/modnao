import clsx from 'clsx';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, ButtonBase, Skeleton, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ContentViewMode, NLUITextureDef } from '@/types';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import GuiPanelTextureModelNavMenu from './GuiPanelTextureModelNavMenu';
import type { TextureModelReference } from '@/modules/model-data';
import { selectModel, selectModels } from '@/selectors';
import { setObjectViewedIndex } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { useTextureReplaceDropzone } from '@/modules/replace-texture';
import ImageBufferCanvas from '@/components/ImageBufferCanvas';
import globalBuffers from '@/utils/data/globalBuffers';
import { createUvClipPaths } from '@/utils/textures';

const HOVERED_MODEL_UV_PULSE_MS = 2000;
const HOVERED_MODEL_UV_MAX_ALPHA = 0.275;
const HOVERED_MODEL_UV_COLORS = [
  [255, 209, 102],
  [6, 214, 160],
  [17, 138, 178],
  [239, 71, 111],
  [131, 56, 236],
  [251, 133, 0]
] as const;

const panelTextureSx: SxProps<Theme> = (theme) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '174px',
  flex: '0 0 auto',
  backgroundColor: 'var(--mui-palette-panelTexture-background, transparent)',
  '& .file-drag-active:after': theme.mixins.fileDragActiveAfter,
  '& .img': {
    width: '100%',
    height: '100%',
    opacity: 1,
    transform: 'rotate(-90deg)'
  },
  '& .selected:after': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    content: "''",
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: 'var(--mui-palette-primary-main)',
    pointerEvents: 'none'
  },
  '&.mode-textures.selectable': {
    cursor: 'pointer'
  },
  '& .uv-overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: '3px solid transparent',
    pointerEvents: 'none'
  },
  '& .uv-overlay canvas': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    transform: 'rotate(-90deg)',
    pointerEvents: 'none'
  },
  '& .size-notation': {
    position: 'absolute',
    right: 'var(--mui-spacing)',
    bottom: 'var(--mui-spacing)',
    color: 'var(--mui-palette-primary-contrastText)',
    textShadow: '1px 1px 1px black',
    filter: 'drop-shadow(3px 3px 1px black)',
    userSelect: 'none'
  },
  '&:hover .MuiIconButton-root': {
    opacity: 1
  }
});

export type GuiPanelTextureProps =
  | {
      selected: boolean;
      textureDef: NLUITextureDef;
      textureIndex: number;
      selectedTextureReferences: {
        meshIndex: number;
        polygonIndexes?: number[];
      }[];
      contentViewMode: ContentViewMode;
    }
  | {
      selected: undefined;
      textureDef: undefined;
      textureIndex: undefined;
      selectedTextureReferences: undefined;
      contentViewMode: undefined;
    };

type ClipPath = { x: number; y: number }[];
interface ClipPathGroup {
  paths: ClipPath[];
  color?: Readonly<[r: number, g: number, b: number]>;
}

export default function GuiPanelTexture(props: GuiPanelTextureProps) {
  const {
    selected,
    textureDef,
    textureIndex = -1,
    selectedTextureReferences = [],
    contentViewMode = 'textures'
  } = props;
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const models = useAppSelector(selectModels);
  const [hoveredModelReference, setHoveredModelReference] =
    useState<TextureModelReference>();
  const { textureViewMode, uvRegionsHighlighted } =
    useContext(SceneOptionsContext);

  const uvClipPathGroups = useMemo<ClipPathGroup[]>(() => {
    if (!textureDef) {
      return [];
    }

    if (hoveredModelReference) {
      const hoveredModel = models[hoveredModelReference.modelIndex];
      const pathGroups: ClipPathGroup[] = [];

      hoveredModelReference.meshIndexes.forEach((meshIndex, referenceIndex) => {
        const hoveredMesh = hoveredModel?.meshes[meshIndex];

        if (!hoveredMesh?.polygons.length) {
          return;
        }

        const paths: ClipPath[] = [];

        hoveredMesh.polygons.forEach((p) => {
          for (let i = 0; i < p.triIndices.length; i += 4) {
            const uvs = p.triIndices
              .slice(i, i + 3)
              .map((triIndex) => p.vertices[triIndex].uv);

            paths.push(
              ...createUvClipPaths(
                uvs,
                textureDef.width,
                textureDef.height,
                hoveredMesh.textureWrappingFlags
              )
            );
          }
        });

        if (paths.length) {
          pathGroups.push({
            paths,
            color:
              HOVERED_MODEL_UV_COLORS[
                referenceIndex % HOVERED_MODEL_UV_COLORS.length
              ]
          });
        }
      });

      return pathGroups;
    }

    if (!(selected && selectedTextureReferences.length)) {
      return [];
    }

    const paths: ClipPath[] = [];
    for (
      let referenceIndex = 0;
      referenceIndex < selectedTextureReferences.length;
      referenceIndex++
    ) {
      const { meshIndex, polygonIndexes } =
        selectedTextureReferences[referenceIndex];
      const mesh = model?.meshes[meshIndex];

      if (!mesh?.polygons.length) {
        continue;
      }

      const polygons = !polygonIndexes?.length
        ? mesh.polygons
        : polygonIndexes
            .map((selectedPolygonIndex) => mesh.polygons[selectedPolygonIndex])
            .filter(Boolean);

      for (let pIndex = 0; pIndex < polygons.length; pIndex++) {
        const p = polygons[pIndex];
        for (let i = 0; i < p.triIndices.length; i += 4) {
          const uvs = p.triIndices
            .slice(i, i + 3)
            .map((triIndex) => p.vertices[triIndex].uv);

          paths.push(
            ...createUvClipPaths(
              uvs,
              textureDef.width,
              textureDef.height,
              mesh.textureWrappingFlags
            )
          );
        }
      }
    }

    return [{ paths }];
  }, [
    hoveredModelReference,
    model,
    models,
    selected,
    selectedTextureReferences,
    textureDef
  ]);

  const uvClipPaths = useMemo(
    () => uvClipPathGroups.flatMap(({ paths }) => paths),
    [uvClipPathGroups]
  );

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const { width = 0, height = 0 } = textureDef || {};

  const imageBufferKey =
    (textureViewMode === 'opaque'
      ? textureDef?.bufferKeys?.opaque || textureDef?.bufferKeys?.translucent
      : textureDef?.bufferKeys?.translucent ||
        textureDef?.bufferKeys?.opaque) || '';

  const rgbaBuffer = useMemo(
    () =>
      imageBufferKey ? globalBuffers.get(imageBufferKey) : new Uint8Array(0),
    [imageBufferKey]
  );

  const showUvHighlight = Boolean(
    uvClipPaths.length &&
    (hoveredModelReference || (uvRegionsHighlighted && selected))
  );
  const shouldPulseUvColorOverlay = Boolean(
    hoveredModelReference && showUvHighlight
  );
  const uvHighlightBufferKey = showUvHighlight
    ? textureDef?.bufferKeys?.opaque
    : undefined;
  const shouldUseSeparateUvHighlightBuffer =
    uvHighlightBufferKey && uvHighlightBufferKey !== imageBufferKey;
  const uvHighlightRgbaBuffer = useMemo(
    () =>
      shouldUseSeparateUvHighlightBuffer
        ? globalBuffers.get(uvHighlightBufferKey)
        : undefined,
    [shouldUseSeparateUvHighlightBuffer, uvHighlightBufferKey]
  );

  const [textureBitmaps, setTextureBitmaps] = useState<{
    source: ImageBitmap | null;
    highlight: ImageBitmap | null;
  }>({
    source: null,
    highlight: null
  });

  useEffect(() => {
    let active = true;

    Promise.all(
      [rgbaBuffer, uvHighlightRgbaBuffer].map((buffer) => {
        if (
          !buffer?.length ||
          !width ||
          !height ||
          buffer.length !== width * height * 4
        ) {
          return null;
        }

        return createImageBitmap(
          new ImageData(new Uint8ClampedArray(buffer), width, height)
        );
      })
    ).then(([source, highlight]) => {
      if (active) {
        setTextureBitmaps({ source, highlight });
      }
    });

    return () => {
      active = false;
    };
  }, [rgbaBuffer, uvHighlightRgbaBuffer, width, height]);

  const imgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId = 0;

    const draw = () => {
      const canvas = imgCanvasRef.current;
      if (canvas && textureBitmaps.source) {
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, width, height);
          context.globalAlpha = showUvHighlight ? 0.25 : 1;
          context.filter = `saturate(${showUvHighlight ? '0' : '1'})`;
          context.drawImage(textureBitmaps.source, 0, 0);

          if (!showUvHighlight) {
            return;
          }

          const highlightTextureBitmap =
            textureBitmaps.highlight ?? textureBitmaps.source;
          const colorOverlayAlpha = shouldPulseUvColorOverlay
            ? HOVERED_MODEL_UV_MAX_ALPHA *
              ((Math.cos(
                (performance.now() / HOVERED_MODEL_UV_PULSE_MS) * Math.PI * 2
              ) +
                1) /
                2)
            : HOVERED_MODEL_UV_MAX_ALPHA;

          context.globalAlpha = 1;
          context.filter = 'saturate(1)';

          context.save();

          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((90 * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          uvClipPathGroups.forEach(({ paths, color }) => {
            paths.forEach((points) => {
              if (points.length === 0) {
                return;
              }

              context.save();
              context.beginPath();
              context.moveTo(points[0].x, points[0].y);

              for (let i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y);
              }

              context.closePath();
              context.clip();

              context.translate(canvas.width / 2, canvas.height / 2);
              context.rotate((-90 * Math.PI) / 180);
              context.translate(-canvas.width / 2, -canvas.height / 2);

              context.drawImage(highlightTextureBitmap, 0, 0);

              if (color) {
                const [red, green, blue] = color;
                context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${colorOverlayAlpha})`;
                context.fillRect(0, 0, canvas.width, canvas.height);
              }

              context.restore();
            });
          });
          context.restore();
        }
      }

      if (shouldPulseUvColorOverlay) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    textureBitmaps,
    uvClipPathGroups,
    showUvHighlight,
    shouldPulseUvColorOverlay
  ]);

  const isSelectable = contentViewMode === 'textures' && !selected;

  const mainContentProps = useMemo(
    () => ({
      id: `gui-panel-t-${textureIndex}`,
      className: clsx(
        selected && 'selected',
        isDragActive && 'file-drag-active',
        uvRegionsHighlighted
      ),
      ...getDragProps(),
      ...(!isSelectable
        ? {}
        : {
            onClick: () => dispatch(setObjectViewedIndex(textureIndex)),
            tabIndex: 0
          })
    }),
    [isDragActive, uvRegionsHighlighted, selected, textureIndex, isSelectable]
  );

  if (!imageBufferKey) {
    return (
      <Box
        className={clsx(
          `mode-${contentViewMode}`,
          isSelectable && 'selectable'
        )}
        sx={panelTextureSx}
      >
        <Skeleton
          variant='rectangular'
          height={170}
          width='100%'
          className='img'
        />
      </Box>
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

  const imgAreaProps = {
    component: isSelectable ? 'button' : 'div',
    sx: {
      width: '100%',
      position: 'relative',
      display: 'flex',
      aspectRatio: '1 / 1'
    },
    ...mainContentProps,
    className: mainContentProps.className
  };

  return (
    <Box
      className={clsx(
        `mode-${contentViewMode}`,
        isSelectable && 'selectable',
        uvRegionsHighlighted && 'uvs-enabled'
      )}
      sx={panelTextureSx}
    >
      {!isSelectable ? (
        <Box {...imgAreaProps}>{content}</Box>
      ) : (
        <Tooltip title='Select this texture'>
          <ButtonBase {...imgAreaProps}>{content}</ButtonBase>
        </Tooltip>
      )}
      {textureDef ? (
        <>
          <GuiPanelTextureMenu
            textureIndex={textureIndex}
            pixelBufferKeys={textureDef.bufferKeys}
            onReplaceImageFile={onSelectNewImageFile}
          />
          <GuiPanelTextureModelNavMenu
            textureIndex={textureIndex}
            onModelReferenceHover={setHoveredModelReference}
          />
        </>
      ) : undefined}
    </Box>
  );
}
