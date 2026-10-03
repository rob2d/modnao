import ImageBufferCanvas from '@/components/ImageBufferCanvas';
import { useResizeObserverSize } from '@/hooks';
import { closeDialog } from '@/modules/dialogs';
import { $updatedTextureDefs } from '@/derivedState';
import globalBuffers from '@/utils/data/globalBuffers';
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography
} from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import downloadModelDataPatch from '../downloadModelDataPatch';
import { $models, $originalModels } from '../modelDataStore';

const TEXTURE_TILE_SIZE = 136;
const TEXTURE_TILE_GAP = 8;

export default function ModelDataPatchExportDialog() {
  'use no memo';

  const models = $models.value;
  const hasOriginalModels = $originalModels.value.length > 0;
  const textureDefs = $updatedTextureDefs.value;
  const textureOptions = useMemo(
    () =>
      textureDefs.flatMap(({ bufferKeys, width, height }, textureIndex) => {
        const translucentBufferKey = bufferKeys?.translucent;

        if (!translucentBufferKey) {
          return [];
        }

        const rgbaBuffer = globalBuffers.get(translucentBufferKey);

        return rgbaBuffer.length !== width * height * 4
          ? []
          : [{ textureIndex, width, height, rgbaBuffer }];
      }),
    [textureDefs]
  );
  const [selectedTextureIndexes, setSelectedTextureIndexes] = useState(() =>
    textureOptions.map(({ textureIndex }) => textureIndex)
  );
  const [onlyChangedVertexColors, setOnlyChangedVertexColors] = useState(false);
  const textureGridRef = useRef<HTMLDivElement>(null);
  const { width: textureGridWidth } = useResizeObserverSize(textureGridRef, {
    width: 0,
    height: 0
  });
  const textureColumnCount = useMemo(() => {
    const textureCount = textureOptions.length;
    const maxColumnCount = Math.max(
      1,
      Math.floor(
        (textureGridWidth + TEXTURE_TILE_GAP) /
          (TEXTURE_TILE_SIZE + TEXTURE_TILE_GAP)
      )
    );
    const naturalColumnCount = Math.min(textureCount, maxColumnCount);
    const rowCount = Math.ceil(textureCount / naturalColumnCount);
    const finalRowCount = textureCount % naturalColumnCount;

    return rowCount === 2 && finalRowCount <= naturalColumnCount / 2
      ? Math.ceil(textureCount / 2)
      : naturalColumnCount;
  }, [textureGridWidth, textureOptions.length]);
  const hasVertexColors = models.some((model) =>
    model.meshes.some((mesh) => mesh.hasColoredVertices)
  );

  const onClose = useCallback(() => {
    closeDialog();
  }, []);

  const onSelectAll = useCallback(() => {
    setSelectedTextureIndexes(
      textureOptions.map(({ textureIndex }) => textureIndex)
    );
  }, [textureOptions]);

  const onSelectNone = useCallback(() => {
    setSelectedTextureIndexes([]);
  }, []);

  const onToggleTexture = useCallback((textureIndex: number) => {
    setSelectedTextureIndexes((textureIndexes) =>
      textureIndexes.includes(textureIndex)
        ? textureIndexes.filter((index) => index !== textureIndex)
        : [...textureIndexes, textureIndex]
    );
  }, []);

  const onDownload = useCallback(() => {
    downloadModelDataPatch({
      textureIndexes: selectedTextureIndexes,
      onlyChangedVertexColors
    });
    closeDialog();
  }, [onlyChangedVertexColors, selectedTextureIndexes]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%'
      }}
    >
      <Typography variant='h5'>Export Patch</Typography>
      {!hasVertexColors || !hasOriginalModels ? null : (
        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyChangedVertexColors}
                onChange={({ target }) =>
                  setOnlyChangedVertexColors(target.checked)
                }
                color='error'
              />
            }
            label='Only include vertex colors changed during this editing session'
            sx={
              onlyChangedVertexColors
                ? { color: 'var(--mui-palette-error-main)' }
                : undefined
            }
          />
          <Typography
            variant='caption'
            color={onlyChangedVertexColors ? 'error' : 'text.secondary'}
            sx={{ display: 'block', ml: 4, mt: -1, mb: 0.5 }}
          >
            Compares against the originally loaded polygon data. Unchanged
            colors will not be available when applying this patch alone.
          </Typography>
        </Box>
      )}
      <Divider sx={{ mt: 1 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          py: 1
        }}
      >
        <Typography variant='subtitle1'>
          Textures included ({selectedTextureIndexes.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={onSelectAll}
            disabled={selectedTextureIndexes.length === textureOptions.length}
            size='small'
          >
            Select All
          </Button>
          <Button
            onClick={onSelectNone}
            disabled={selectedTextureIndexes.length === 0}
            size='small'
          >
            Select None
          </Button>
        </Box>
      </Box>
      <Box
        ref={textureGridRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: textureGridWidth
            ? `repeat(${textureColumnCount}, ${TEXTURE_TILE_SIZE}px)`
            : `repeat(auto-fit, ${TEXTURE_TILE_SIZE}px)`,
          justifyContent: 'center',
          gap: `${TEXTURE_TILE_GAP}px`,
          minHeight: 0,
          overflowY: 'auto',
          pb: 1.5
        }}
      >
        {textureOptions.map(({ textureIndex, width, height, rgbaBuffer }) => {
          const selected = selectedTextureIndexes.includes(textureIndex);

          return (
            <ButtonBase
              key={textureIndex}
              aria-label={`Include texture ${textureIndex}`}
              aria-pressed={selected}
              onClick={() => onToggleTexture(textureIndex)}
              sx={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                aspectRatio: '1 / 1',
                minWidth: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                '&[aria-pressed="true"]:after': {
                  position: 'absolute',
                  inset: 0,
                  content: "''",
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: 'var(--mui-palette-primary-main)',
                  pointerEvents: 'none'
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  aspectRatio: '1',
                  bgcolor: 'var(--mui-palette-background-default)',
                  overflow: 'hidden',
                  '& canvas': {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }}
              >
                <ImageBufferCanvas
                  rgbaBuffer={rgbaBuffer}
                  width={width}
                  height={height}
                  alt={`Texture ${textureIndex} preview`}
                />
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
                {width} x {height}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
      <Divider />
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1.5 }}
      >
        <Button onClick={onClose} color='secondary' variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={onDownload}
          disabled={!selectedTextureIndexes.length && !hasVertexColors}
          color='primary'
          variant='outlined'
        >
          Export Patch
        </Button>
      </Box>
    </Box>
  );
}
