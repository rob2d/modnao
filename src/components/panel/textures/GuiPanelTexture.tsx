import clsx from 'clsx';
import { useContext, useMemo } from 'react';
import Img from 'next/image';
import {
  ButtonBase,
  Skeleton,
  styled,
  Tooltip,
  Typography
} from '@mui/material';
import { NLUITextureDef } from '@/types/NLAbstractions';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';
import {
  selectMesh,
  setObjectViewedIndex,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { uvToCssPathPoint } from '@/utils/textures';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import ContentViewMode from '@/types/ContentViewMode';
import themeMixins from '@/theming/themeMixins';
import { useTextureReplaceDropzone } from '@/hooks';

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

  &.uvs-enabled.mode-polygons .selected .img {
    filter: saturate(0);
    opacity: 0.25;
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

  const uvClipPaths = useMemo<string[]>(() => {
    if (
      !(selected && mesh?.polygons.length) ||
      contentViewMode !== 'polygons'
    ) {
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
  }, [
    selected && mesh?.polygons,
    polygonIndex,
    contentViewMode !== 'polygons'
  ]);

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const { width = 0, height = 0 } = textureDef || {};

  // if there's a currently selected mesh and it's opaque, prioritize opaque,
  // otherwise fallback to actionable dataUrl
  const imageDataUrl =
    (selected && mesh?.isOpaque
      ? textureDef?.dataUrls?.opaque || textureDef?.dataUrls?.translucent
      : textureDef?.dataUrls?.translucent || textureDef?.dataUrls?.opaque) ||
    '';

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
      isSelectable,
      dispatch
    ]
  );

  if (!imageDataUrl) {
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
    <>
      <Img
        src={imageDataUrl}
        width={width}
        height={height}
        alt={`Texture # ${textureIndex}`}
        className='img'
      />
      {uvOverlays}
      <Typography
        variant='subtitle2'
        textAlign='right'
        className='size-notation'
      >
        {textureDef?.width ?? '0'}x{textureDef?.height ?? '0'} [{textureIndex}]
      </Typography>
    </>
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
          pixelsObjectUrls={textureDef.bufferUrls}
          onReplaceImageFile={onSelectNewImageFile}
        />
      ) : undefined}
    </StyledPanelTexture>
  );
}
