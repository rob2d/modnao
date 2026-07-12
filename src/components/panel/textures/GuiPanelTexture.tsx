import clsx from 'clsx';
import {
  MouseEvent,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  ButtonBase,
  IconButton,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ContentViewMode, NLUITextureDef } from '@/types';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import GuiPanelTextureModelNavMenu from './GuiPanelTextureModelNavMenu';
import GuiPanelTextureUvPreview, {
  type ClipPathGroup
} from './GuiPanelTextureUvPreview';
import type { TextureModelReference } from '@/modules/model-data';
import { selectModel, selectModels } from '@/selectors';
import { setObjectViewedIndex } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { useTextureReplaceDropzone } from '@/modules/replace-texture';
import { createUvClipPaths, UvClipPath } from '@/utils/textures';

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
  '& .texture-overlay': {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.short
    }),
    pointerEvents: 'none',
    zIndex: 1
  },
  '& .texture-overlay-content': {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  '& .texture-overlay-actions': {
    position: 'absolute',
    top: 'calc(var(--mui-spacing) * 0.5)',
    right: 0,
    display: 'flex',
    pointerEvents: 'auto'
  },
  '& .texture-overlay .MuiIconButton-root svg': {
    ...theme.mixins.dropShadowContrast,
    color: 'var(--mui-palette-primary-contrastText)',
    mixBlendMode: 'normal'
  },
  '&:hover .texture-overlay, & .texture-overlay:focus-within': {
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

// rotate in 90 deg to match the orientation of stored textures
const rotateUvClipPathForTextureEdit = (
  path: UvClipPath,
  width: number,
  height: number
) =>
  path.map(({ x, y }) => ({
    x: width / 2 + height / 2 - y,
    y: height / 2 + x - width / 2
  }));

const createMeshUvClipPaths = (
  mesh: NLMesh | undefined,
  width: number,
  height: number,
  polygonIndexes?: number[]
) => {
  if (!mesh?.polygons.length) {
    return [];
  }

  const polygons = !polygonIndexes?.length
    ? mesh.polygons
    : polygonIndexes.flatMap((polygonIndex) => {
        const polygon = mesh.polygons[polygonIndex];

        return polygon ? [polygon] : [];
      });
  const paths: UvClipPath[] = [];

  polygons.forEach((polygon) => {
    for (let i = 0; i < polygon.triIndices.length; i += 4) {
      const uvs = polygon.triIndices
        .slice(i, i + 3)
        .map((triIndex) => polygon.vertices[triIndex].uv);

      paths.push(
        ...createUvClipPaths(uvs, width, height, mesh.textureWrappingFlags)
      );
    }
  });

  return paths;
};

export default function GuiPanelTexture(props: GuiPanelTextureProps) {
  const {
    selected,
    textureDef,
    textureIndex = -1,
    selectedTextureReferences = [],
    contentViewMode = 'textures'
  } = props;
  const dispatch = useAppDispatch();
  const textureContainerRef = useRef<HTMLDivElement>(null);
  const model = useAppSelector(selectModel);
  const models = useAppSelector(selectModels);
  const [hoveredModelReference, setHoveredModelReference] =
    useState<TextureModelReference>();
  const [textureMenuAnchorEl, setTextureMenuAnchorEl] =
    useState<HTMLElement | null>(null);
  const [modelNavMenuAnchorEl, setModelNavMenuAnchorEl] =
    useState<HTMLElement | null>(null);
  const { textureViewMode, uvRegionsHighlighted } =
    useContext(SceneOptionsContext);
  const { width = 0, height = 0 } = textureDef || {};
  const textureMenuOpen = Boolean(textureMenuAnchorEl);
  const modelNavMenuOpen = Boolean(modelNavMenuAnchorEl);

  const onOpenTextureMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    setTextureMenuAnchorEl(textureContainerRef.current ?? event.currentTarget);
  }, []);

  const onCloseTextureMenu = useCallback(() => {
    setTextureMenuAnchorEl(null);
  }, []);

  const onOpenModelNavMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    setModelNavMenuAnchorEl(textureContainerRef.current ?? event.currentTarget);
  }, []);

  const onCloseModelNavMenu = useCallback(() => {
    setModelNavMenuAnchorEl(null);
  }, []);

  const hoveredUvClipPathGroups = useMemo<ClipPathGroup[]>(() => {
    if (!textureDef) {
      return [];
    }

    if (!hoveredModelReference) {
      return [];
    }

    const hoveredModel = models[hoveredModelReference.modelIndex];
    const pathGroups: ClipPathGroup[] = [];

    hoveredModelReference.meshIndexes.forEach((meshIndex, referenceIndex) => {
      const paths = createMeshUvClipPaths(
        hoveredModel?.meshes[meshIndex],
        textureDef.width,
        textureDef.height
      );

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
  }, [hoveredModelReference, models, textureDef]);

  const selectedUvClipPathGroups = useMemo<ClipPathGroup[]>(() => {
    if (!textureDef) {
      return [];
    }

    if (
      !(selected && uvRegionsHighlighted && selectedTextureReferences.length)
    ) {
      return [];
    }

    const paths: UvClipPath[] = [];
    for (
      let referenceIndex = 0;
      referenceIndex < selectedTextureReferences.length;
      referenceIndex++
    ) {
      const { meshIndex, polygonIndexes } =
        selectedTextureReferences[referenceIndex];

      paths.push(
        ...createMeshUvClipPaths(
          model?.meshes[meshIndex],
          textureDef.width,
          textureDef.height,
          polygonIndexes
        )
      );
    }

    return [{ paths }];
  }, [
    model,
    selected,
    selectedTextureReferences,
    textureDef,
    uvRegionsHighlighted
  ]);

  const uvClipPathGroups = hoveredModelReference
    ? hoveredUvClipPathGroups
    : selectedUvClipPathGroups;

  const selectedTextureEditUvClipPaths = useMemo(() => {
    if (!(selected && uvRegionsHighlighted)) {
      return [];
    }

    return selectedUvClipPathGroups.flatMap(({ paths }) =>
      paths.map((path) => rotateUvClipPathForTextureEdit(path, width, height))
    );
  }, [height, selected, selectedUvClipPathGroups, uvRegionsHighlighted, width]);

  const hasUvClipPaths = useMemo(
    () => uvClipPathGroups.some(({ paths }) => paths.length > 0),
    [uvClipPathGroups]
  );

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const imageBufferKey =
    (textureViewMode === 'opaque'
      ? textureDef?.bufferKeys?.opaque || textureDef?.bufferKeys?.translucent
      : textureDef?.bufferKeys?.translucent ||
        textureDef?.bufferKeys?.opaque) || '';

  const showUvHighlight = Boolean(
    hasUvClipPaths &&
    (hoveredModelReference || (uvRegionsHighlighted && selected))
  );
  const shouldPulseUvColorOverlay = Boolean(
    hoveredModelReference && showUvHighlight
  );
  const uvHighlightBufferKey = showUvHighlight
    ? textureDef?.bufferKeys?.opaque
    : undefined;

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
    <GuiPanelTextureUvPreview
      imageBufferKey={imageBufferKey}
      uvHighlightBufferKey={uvHighlightBufferKey}
      uvClipPathGroups={uvClipPathGroups}
      showUvHighlight={showUvHighlight}
      shouldPulseUvColorOverlay={shouldPulseUvColorOverlay}
      width={width}
      height={height}
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
      ref={textureContainerRef}
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
          <Box className='texture-overlay'>
            <Box className='texture-overlay-content'>
              <Box className='texture-overlay-actions'>
                <Tooltip title='Find models this texture is used in'>
                  <IconButton
                    color='primary'
                    aria-haspopup='true'
                    onClick={onOpenModelNavMenu}
                    sx={{ visibility: modelNavMenuOpen ? 'hidden' : 'visible' }}
                  >
                    <AccountTreeIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Texture options'>
                  <IconButton
                    color='primary'
                    aria-haspopup='true'
                    onClick={onOpenTextureMenu}
                    sx={{ visibility: textureMenuOpen ? 'hidden' : 'visible' }}
                  >
                    <MoreVertIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                color='primary.contrastText'
                variant='technical'
                sx={(theme) => ({
                  position: 'absolute',
                  bottom: 'var(--mui-spacing)',
                  right: 'var(--mui-spacing)',
                  ...theme.mixins.dropShadowContrast
                })}
              >
                {textureDef.width} x {textureDef.height}
              </Typography>
            </Box>
          </Box>
          <GuiPanelTextureMenu
            textureIndex={textureIndex}
            pixelBufferKeys={textureDef.bufferKeys}
            selectedUvClipPaths={selectedTextureEditUvClipPaths}
            onReplaceImageFile={onSelectNewImageFile}
            anchorEl={textureMenuAnchorEl}
            open={textureMenuOpen}
            onClose={onCloseTextureMenu}
          />
          <GuiPanelTextureModelNavMenu
            textureIndex={textureIndex}
            onModelReferenceHover={setHoveredModelReference}
            anchorEl={modelNavMenuAnchorEl}
            open={modelNavMenuOpen}
            onClose={onCloseModelNavMenu}
          />
        </>
      ) : undefined}
    </Box>
  );
}
