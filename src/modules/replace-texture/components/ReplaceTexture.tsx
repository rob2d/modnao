import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Image } from 'image-js';
import Img from 'next/image';
import CheckIcon from '@mui/icons-material/Check';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Skeleton,
  Slider,
  Tooltip,
  Typography
} from '@mui/material';
import {
  selectReplacementImage,
  selectReplacementTextureIndex,
  selectUpdatedTextureDefs
} from '@/selectors';
import { closeDialog } from '@/modules/dialogs';
import { applyReplacedTextureImage } from '../replaceTextureSlice';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { useDebouncedEffect } from '@/hooks';
import useTextureReplaceDropzone from '../hooks/useTextureReplaceDropzone';
import cropImage from '@/utils/images/cropImage';
import type { NLUITextureDef } from '@/types';
import { useFilePicker } from 'use-file-picker';
import globalBuffers from '@/utils/data/globalBuffers';
import ImageBufferCanvas from '@/components/ImageBufferCanvas';

const DEFAULT_FLIP_STATE = { horizontal: false, vertical: false };

const optionAppliedCheckmark = (
  <CheckIcon fontSize='small' sx={{ position: 'absolute', right: 0, top: 0 }} />
);

export default function ReplaceTexture() {
  const dispatch = useAppDispatch();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imageDataUrl, setImageDataUrl] = useState(() => '');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [processedRgba, setProcessedRgba] = useState<
    Uint8Array | Uint8ClampedArray | null
  >(() => null);
  const [previewDataUrl, setPreviewDataUrl] = useState(() => '');
  const [flip, setFlip] = useState(() => DEFAULT_FLIP_STATE);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onChangeZoom = useCallback((_: Event, zoom: number | number[]) => {
    setZoom(typeof zoom !== 'number' ? zoom[0] : zoom);
  }, []);

  const onChangeRotation = useCallback(
    (_: Event, rotation: number | number[]) => {
      setRotation(typeof rotation !== 'number' ? rotation[0] : rotation);
    },
    []
  );

  const onFlipHorizontal = useCallback(() => {
    setFlip((prevFlip) => ({
      ...prevFlip,
      horizontal: !prevFlip.horizontal
    }));
  }, []);

  const onFlipVertical = useCallback(() => {
    setFlip((prevFlip) => ({
      ...prevFlip,
      vertical: !prevFlip.vertical
    }));
  }, []);

  const onResetZoom = useCallback(() => setZoom(1), []);
  const onResetRotation = useCallback(() => setRotation(0), []);

  const onRotateRight = useCallback(() => {
    setRotation(Math.floor(rotation / 90) * 90 + 90);
  }, [rotation]);

  const onCancelReplaceTexture = useCallback(() => {
    dispatch(closeDialog());
  }, [dispatch]);

  const onApplyReplaceTexture = useCallback(() => {
    if (!processedRgba) {
      return;
    }
    dispatch(applyReplacedTextureImage(new Uint8Array(processedRgba)));
  }, [processedRgba, dispatch]);

  const textureDefs: NLUITextureDef[] = useAppSelector(
    selectUpdatedTextureDefs
  );
  const textureIndex = useAppSelector(selectReplacementTextureIndex);
  const replacementImage = useAppSelector(selectReplacementImage);
  const originalWidth = textureDefs?.[textureIndex]?.width || 0;
  const originalHeight = textureDefs?.[textureIndex]?.height || 0;
  const textureFormat = textureDefs?.[textureIndex]?.colorFormat;

  const referenceTextureStyle = useMemo(
    () => ({
      width: Math.min(originalWidth, 256),
      height: Math.min(originalHeight, 256)
    }),
    [originalWidth, originalHeight]
  );

  const [viewTranslucentOrigin, setViewTranslucentOrigin] = useState(
    () => false
  );

  const [viewTranslucentPreview, setViewTranslucentPreview] = useState(
    () => true
  );

  const [preserveOriginAlpha, setPreserveOriginAlpha] = useState(() => true);

  const [originTextureBuffer, setOriginTextureBuffer] =
    useState<Uint8Array | null>(() => null);

  useEffect(() => {
    (async () => {
      if (!processedRgba) {
        return;
      }

      const previewRgba = new Uint8Array(processedRgba);

      if (!viewTranslucentPreview) {
        for (let i = 0; i < previewRgba.length; i += 4) {
          previewRgba[i + 3] = 255;
        }
      }

      const image = new Image({
        data: previewRgba,
        width: originalWidth,
        height: originalHeight
      });

      setPreviewDataUrl(image.toDataURL());
    })();
  }, [
    `${originalWidth}_${originalHeight}_${viewTranslucentPreview}`,
    processedRgba
  ]);

  useEffect(() => {
    (() =>
      (async () => {
        if (!replacementImage) {
          return;
        }

        const { width, height, bufferKey } = replacementImage;

        const data = globalBuffers.get(bufferKey || '');
        const dataUrl = new Image({
          data,
          width,
          height
        }).toDataURL();

        setImageDataUrl(dataUrl);
      })())();
  }, [replacementImage]);

  useDebouncedEffect(
    () => {
      if (!croppedAreaPixels) {
        return;
      }
      (async () => {
        //@TODO: revisit/optimize this logic so debounce time can be decreased
        const nextCroppedImage =
          (await cropImage(imageDataUrl, croppedAreaPixels, rotation, flip)) ||
          '';

        const resizedImage = (await Image.load(nextCroppedImage)).resize({
          width: originalWidth,
          height: originalHeight
        });

        // restore the original alpha coverage after crop/resize
        if (preserveOriginAlpha && originTextureBuffer) {
          const sharedBuffer = new SharedArrayBuffer(
            resizedImage.width * resizedImage.height * 4
          );
          const rgbaBuffer = new Uint8Array(sharedBuffer);
          rgbaBuffer.set(resizedImage.getRGBAData());

          for (let i = 0; i < rgbaBuffer.length; i += 4) {
            rgbaBuffer[i + 3] = originTextureBuffer[i + 3];
          }
          setProcessedRgba(rgbaBuffer);
        } else {
          setProcessedRgba(resizedImage.getRGBAData());
        }
      })();
    },
    [
      imageDataUrl,
      originalWidth,
      originalHeight,
      originTextureBuffer,
      preserveOriginAlpha,
      zoom,
      rotation,
      flip,
      croppedAreaPixels
    ],
    200
  );

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const {
    plainFiles: [selectedImageFile],
    openFilePicker
  } = useFilePicker({
    multiple: false,
    readAs: 'ArrayBuffer',
    accept: ['image/*']
  });

  useEffect(() => {
    if (!selectedImageFile) {
      return;
    }

    onSelectNewImageFile(selectedImageFile);
  }, [selectedImageFile]);

  useEffect(() => {
    (async () => {
      const originTextureBufferKey =
        textureDefs?.[textureIndex]?.bufferKeys?.['translucent'] || '';
      if (!originTextureBufferKey) {
        return;
      }
      const textureBuffer = globalBuffers.get(originTextureBufferKey);
      setOriginTextureBuffer(textureBuffer);
    })();
  }, [textureDefs?.[textureIndex]?.bufferKeys?.['translucent'] || '']);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 0,
          '& .texture-img-container': {
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            m: 0,
            mb: 1,
            objectFit: 'cover'
          },
          '& .texture-img-container::before': {
            content: "''",
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0.5,
            backgroundColor: 'var(--mui-palette-scene-background)'
          },
          '& .texture-img-container > *': {
            zIndex: 1,
            maxWidth: '100%',
            maxHeight: 'min(180px, 20vh)',
            objectFit: 'contain'
          },
          '& .MuiDivider-vertical': {
            mx: 2
          },
          '& .MuiDivider-root:not(.MuiDivider-vertical)': {
            my: 1
          },
          '& .MuiButtonBase-root.MuiCheckbox-root': {
            pt: 0,
            pb: 0
          }
        }}
      >
        <Box
          {...getDragProps()}
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            minHeight: 0,
            overflow: 'hidden',
            maxHeight: '100%',
            ...(isDragActive
              ? {
                  '&::after': theme.mixins.fileDragActiveAfter
                }
              : {})
          })}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 6,
              minWidth: 0,
              minHeight: 0
            }}
          >
            <Typography variant='h5' sx={{ mb: 1 }}>
              Source Image
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                position: 'relative',
                width: '100%',
                minHeight: 0,
                mb: 2,
                overflow: 'hidden',
                backgroundColor: 'var(--mui-palette-scene-background)'
              }}
            >
              <Cropper
                image={imageDataUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                minZoom={0.1}
                maxZoom={8}
                aspect={originalWidth / originalHeight}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexShrink: 0,
                '& .button-group': {
                  display: 'inline-flex'
                },
                '& .button-group .MuiButtonBase-root.MuiButton-root': {
                  minWidth: '60px'
                },
                '& .MuiSlider-root': {
                  minWidth: '120px',
                  ml: 2
                },
                '& .MuiFormControlLabel-label': {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              <div>
                <div className='button-group'>
                  <FormControlLabel
                    label={<ZoomInIcon fontSize='small' />}
                    labelPlacement='start'
                    control={
                      <Slider
                        size='small'
                        min={0.25}
                        max={8}
                        step={0.25}
                        defaultValue={1}
                        aria-label='Small'
                        valueLabelDisplay='auto'
                        value={zoom}
                        onChange={onChangeZoom}
                      />
                    }
                  />
                  <Tooltip title='Reset zoom to 1x'>
                    <Button color='primary' onClick={onResetZoom}>
                      <RefreshIcon fontSize='small' />
                    </Button>
                  </Tooltip>
                </div>
                <div className='button-group'>
                  <FormControlLabel
                    label={<CropRotateIcon fontSize='small' />}
                    labelPlacement='start'
                    control={
                      <Slider
                        size='small'
                        min={-180}
                        max={180}
                        step={1}
                        defaultValue={0}
                        aria-label='Small'
                        valueLabelDisplay='auto'
                        value={rotation}
                        onChange={onChangeRotation}
                      />
                    }
                  />
                  <Tooltip title='Reset rotation to zero degrees'>
                    <Button color='primary' onClick={onResetRotation}>
                      <RefreshIcon fontSize='small' />
                    </Button>
                  </Tooltip>
                </div>
                <div className='button-group'>
                  <Tooltip title='Rotate to nearest next 90° (appears on preview)'>
                    <Button color='primary' onClick={onRotateRight}>
                      <RotateRightIcon fontSize='small' />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Flip horizontally (appears on preview)'>
                    <Button color='primary' onClick={onFlipHorizontal}>
                      {!flip.horizontal ? undefined : optionAppliedCheckmark}
                      <SwapHorizIcon fontSize='small' />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Flip vertically (appears on preview)'>
                    <Button color='primary' onClick={onFlipVertical}>
                      {!flip.vertical ? undefined : optionAppliedCheckmark}
                      <SwapVertIcon fontSize='small' />
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <div>
                <Tooltip title='Select new image file. You can also drag and drop a file into the overall dialog'>
                  <Button color='primary' onClick={openFilePicker}>
                    <ImageOutlinedIcon fontSize='small' />
                  </Button>
                </Tooltip>
              </div>
            </Box>
          </Box>
          <Divider orientation='vertical' flexItem />
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows:
                'auto minmax(0, 1fr) auto minmax(0, 1fr) auto auto',
              flexShrink: 0,
              maxWidth: { xs: '280px', md: 'none' },
              minHeight: 0,
              overflow: 'hidden',
              '& .MuiFormControlLabel-root': {
                mr: 0
              },
              '& .MuiFormControlLabel-labelPlacementEnd': {
                display: 'block'
              }
            }}
          >
            <Typography variant='h5' sx={{ mb: 1 }}>
              Texture Origin
            </Typography>
            <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
              <div className='texture-img-container'>
                <ImageBufferCanvas
                  rgbaBuffer={originTextureBuffer ?? undefined}
                  alt='original texture to replace'
                  width={originalWidth}
                  height={originalHeight}
                />
              </div>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  '& > .MuiTypography-root': {
                    display: 'flex',
                    alignItems: 'center'
                  },
                  '& > :nth-child(even)': {
                    justifyContent: 'flex-end'
                  }
                }}
              >
                <Typography variant='subtitle1'>Dimensions</Typography>
                <Typography variant='technical'>
                  {originalWidth} x {originalHeight}
                </Typography>
                <Typography variant='subtitle1'>Texture Index</Typography>
                <Typography variant='technical'>{textureIndex}</Typography>
                <Typography variant='subtitle1'>Texture Format</Typography>
                <Typography variant='technical'>{textureFormat}</Typography>
              </Box>
              <Tooltip
                title='Renders fully transparent pixels as transparent; this is useful in cases where there are transparent pixels that have color data.'
                placement='left-start'
              >
                <FormControlLabel
                  control={<Checkbox checked={viewTranslucentOrigin} />}
                  label='View Translucent'
                  labelPlacement='end'
                  onChange={() =>
                    setViewTranslucentOrigin(!viewTranslucentOrigin)
                  }
                />
              </Tooltip>
            </Box>
            <Divider flexItem />
            <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
              <Typography variant='h5' sx={{ mb: 1 }}>
                Result Preview
              </Typography>
              <div className='texture-img-container'>
                {!previewDataUrl ? (
                  <Skeleton
                    variant='rectangular'
                    width={referenceTextureStyle.width}
                    height={referenceTextureStyle.height}
                  />
                ) : (
                  <Img
                    alt='Resulting texture after modifications'
                    src={previewDataUrl}
                    width={referenceTextureStyle.width}
                    height={referenceTextureStyle.height}
                  />
                )}
              </div>
              <Tooltip
                title='Renders fully transparent pixels as transparent; this is useful in cases where there are transparent pixels that have color data.'
                placement='left-start'
              >
                <FormControlLabel
                  control={<Checkbox checked={viewTranslucentPreview} />}
                  label='View Translucent'
                  labelPlacement='end'
                  onChange={() =>
                    setViewTranslucentPreview(!viewTranslucentPreview)
                  }
                />
              </Tooltip>
              <Tooltip
                title={
                  'Keeps the original transparent parts of the texture. Some games also ' +
                  'hide useful colors inside invisible pixels, so leaving this on helps ' +
                  'keep those details.'
                }
                placement='left-start'
              >
                <FormControlLabel
                  control={<Checkbox checked={preserveOriginAlpha} />}
                  label='Preserve original alpha channel'
                  labelPlacement='end'
                  onChange={() => setPreserveOriginAlpha(!preserveOriginAlpha)}
                />
              </Tooltip>
            </Box>
            <Divider flexItem />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0,
                '& > .MuiButton-root:not(:last-child)': {
                  mr: 2
                }
              }}
            >
              <Button
                color='secondary'
                variant='outlined'
                onClick={onCancelReplaceTexture}
              >
                Cancel
              </Button>
              <Button
                color='primary'
                variant='outlined'
                onClick={onApplyReplaceTexture}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
