import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Image } from 'image-js';
import Img from 'next/image';
import {
  mdiCheckBold,
  mdiCropRotate,
  mdiFileImage,
  mdiFlipHorizontal,
  mdiFlipVertical,
  mdiMagnify,
  mdiRefresh,
  mdiRotateRight
} from '@mdi/js';
import Icon from '@mdi/react';
import { nanoid } from 'nanoid';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Slider,
  styled,
  Tooltip,
  Typography
} from '@mui/material';
import {
  closeDialog,
  selectReplacementImage,
  selectReplacementTextureIndex,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { TextureColorFormat } from '@/utils/textures';
import { objectUrlToBuffer } from '@/utils/data';
import { useDebouncedEffect, useTextureReplaceDropzone } from '@/hooks';
import cropImage from '@/utils/images/cropImage';
import { applyReplacedTextureImage } from '@/store/replaceTextureSlice';
import { NLTextureDef } from '@/types/NLAbstractions';
import clsx from 'clsx';
import { useFilePicker } from 'use-file-picker';
import themeMixins from '@/theming/themeMixins';

const Styled = styled('div')(
  ({ theme }) => `
& {
  display: flex;
  flex-direction: column;
  width: 100%;
}

& .MuiTypography-h5 {
  margin-bottom: ${theme.spacing(2)};
}

& .content {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

& .content.file-drag-active:after {
    ${themeMixins.fileDragActiveAfter}
}

& .section {
  display: flex;
  flex-direction: column;
}

& .replacement-setup {
  flex-grow: 6;
}

& .original-texture {
  flex-shrink: 0;

  ${theme.breakpoints.down('md')} {
    max-width: 280px;
  }
}

& .texture-img-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  margin-bottom: ${theme.spacing(1)};
  object-fit: cover;
}

& .texture-img-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-color: ${theme.palette.scene.background};
}

& .texture-img-container img {
  z-index: 1;
}

& .cropper {
  flex-grow: 1;
  position: relative;
  width: 100%;
  margin-bottom: ${theme.spacing(2)};
  overflow: hidden;
  background-color: ${theme.palette.scene.background};
}

& .controls {
  display: flex;
  justify-content: space-between;
}

& .controls .button-group {
  display: inline-flex;
}

& .controls .button-group .MuiButtonBase-root.MuiButton-root {
  min-width: 60px;
}

& .controls .MuiSlider-root {
  min-width: 120px;
  margin-left: ${theme.spacing(2)};
}

& .controls .MuiFormControlLabel-label {
  display: flex;
  align-items: center;
}


& .original-texture.section .MuiFormControlLabel-labelPlacementEnd {
  display: block;
}


& .controls > .MuiButton-root {
  min-width: 48px;
  margin-left: ${theme.spacing(1)};
}

& .MuiDivider-vertical {
  margin: 0 ${theme.spacing(2)};
}

& .MuiDivider-root:not(.MuiDivider-vertical) {
  margin: ${theme.spacing(2)} 0;
}

& .MuiButton-root .icon-check {
  position: absolute;
  right: 0;
  top: 0;
}


& .origin-metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

& .origin-metadata > .MuiTypography-root {
  display: flex;
  align-items: center;
}

& .origin-metadata > :nth-child(even) {
  justify-content: flex-end;
}

& .result {
  flex-grow: 1;

}

& .dialog-actions {
  display: flex;
  justify-content: flex-end;
}

& .dialog-actions > .MuiButton-root:not(:last-child) {
  margin-right: ${theme.spacing(2)};
}

& .MuiButtonBase-root.MuiCheckbox-root {
  padding-top: 0px;
  padding-bottom: 0px;
}
`
);

const DEFAULT_FLIP_STATE = { horizontal: false, vertical: false };

const optionAppliedCheckmark = (
  <Icon className={'icon-check'} path={mdiCheckBold} size={0.6} />
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
    setFlip({
      ...flip,
      horizontal: !flip.horizontal
    });
  }, [flip]);

  const onFlipVertical = useCallback(() => {
    setFlip({
      ...flip,
      vertical: !flip.vertical
    });
  }, [flip]);

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
    dispatch(applyReplacedTextureImage(processedRgba));
  }, [processedRgba, dispatch]);

  const textureDefs: NLTextureDef[] = useAppSelector(selectUpdatedTextureDefs);
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

  const [originTextureBuffer, setOriginTextureBuffer] = useState<Buffer | null>(
    () => null
  );

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

        const { width, height, bufferObjectUrl } = replacementImage;

        const data = new Uint8ClampedArray(
          await objectUrlToBuffer(bufferObjectUrl || '')
        );

        const dataUrl = new Image({
          data,
          width,
          height
        }).toDataURL();

        setImageDataUrl(dataUrl);
      })())();
  }, [replacementImage]);

  const processedUpdateId = useMemo(
    () => nanoid(),
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
    ]
  );

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

        // restore zero-alpha origin pixels when necessary
        if (preserveOriginAlpha && originTextureBuffer) {
          const rgbaBuffer = resizedImage.getRGBAData();

          for (let i = 0; i < rgbaBuffer.length; i += 4) {
            if (originTextureBuffer[i + 3] === 0) {
              rgbaBuffer[i + 3] = 0;
            }
          }
          setProcessedRgba(rgbaBuffer);
        } else {
          setProcessedRgba(resizedImage.getRGBAData());
        }
      })();
    },
    [processedUpdateId],
    200
  );

  const { getDragProps, isDragActive, onSelectNewImageFile } =
    useTextureReplaceDropzone(textureIndex);

  const [
    openImageFileSelector,
    {
      plainFiles: [selectedImageFile]
    }
  ] = useFilePicker({
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
      const originTextureBufferUrl =
        textureDefs?.[textureIndex]?.bufferUrls?.['translucent'] || '';
      if (!originTextureBufferUrl) {
        return;
      }
      const textureBuffer = Buffer.from(
        await objectUrlToBuffer(originTextureBufferUrl)
      );
      setOriginTextureBuffer(textureBuffer);
    })();
  }, [textureDefs?.[textureIndex]?.bufferUrls?.['translucent'] || '']);

  const originTextureDataUrl =
    textureDefs?.[textureIndex]?.dataUrls?.[
      viewTranslucentOrigin ? 'translucent' : 'opaque'
    ] || '';

  return (
    <>
      <Styled>
        <div
          className={clsx('content', isDragActive && 'file-drag-active')}
          {...getDragProps()}
        >
          <div className='replacement-setup section'>
            <Typography variant='h6'>Source Image</Typography>
            <div className='cropper'>
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
            </div>
            <div className='controls'>
              <div>
                <div className='button-group'>
                  <FormControlLabel
                    label={<Icon path={mdiMagnify} size={1} />}
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
                    <Button
                      color='primary'
                      className='sub-control'
                      onClick={onResetZoom}
                    >
                      <Icon path={mdiRefresh} size={1} />
                    </Button>
                  </Tooltip>
                </div>
                <div className='button-group'>
                  <FormControlLabel
                    label={<Icon path={mdiCropRotate} size={1} />}
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
                    <Button
                      color='primary'
                      className='sub-control'
                      onClick={onResetRotation}
                    >
                      <Icon path={mdiRefresh} size={1} />
                    </Button>
                  </Tooltip>
                </div>
                <div className='button-group'>
                  <Tooltip title='Rotate to nearest next 90° (appears on preview)'>
                    <Button color='primary' onClick={onRotateRight}>
                      <Icon path={mdiRotateRight} size={1} />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Flip horizontally (appears on preview)'>
                    <Button color='primary' onClick={onFlipHorizontal}>
                      {!flip.horizontal ? undefined : optionAppliedCheckmark}
                      <Icon path={mdiFlipHorizontal} size={1} />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Flip vertically (appears on preview)'>
                    <Button color='primary' onClick={onFlipVertical}>
                      {!flip.vertical ? undefined : optionAppliedCheckmark}
                      <Icon path={mdiFlipVertical} size={1} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <div>
                <Tooltip title='Select new image file. You can also drag and drop a file into the overall dialog'>
                  <Button color='primary' onClick={openImageFileSelector}>
                    <Icon path={mdiFileImage} size={1} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <Divider orientation='vertical' flexItem />
          <div className='original-texture section'>
            <Typography variant='h6'>Texture Origin</Typography>
            <div className='original-texture'>
              <div className='texture-img-container'>
                <Img
                  alt='original texture to replace'
                  src={originTextureDataUrl}
                  style={referenceTextureStyle}
                  width={originalWidth}
                  height={originalHeight}
                />
              </div>
              <div className='origin-metadata'>
                <Typography variant='subtitle1'>Dimensions</Typography>
                <Typography variant='body2'>
                  <b>{originalWidth}</b>&nbsp;x&nbsp;<b>{originalHeight}</b>
                </Typography>
                <Typography variant='subtitle1'>Texture Index</Typography>
                <Typography variant='body2'>
                  <b>{textureIndex}</b>
                </Typography>
                <Typography variant='subtitle1'>Texture Format</Typography>
                <Typography variant='body2'>
                  <b>{textureFormat}</b>
                </Typography>
              </div>
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
            </div>
            <Divider flexItem />
            <div className='result'>
              <Typography variant='h6'>Result Preview</Typography>
              <div className='texture-img-container'>
                <Img
                  alt='Resulting texture after modifications'
                  src={previewDataUrl}
                  width={originalWidth}
                  height={originalHeight}
                  style={referenceTextureStyle}
                />
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
                  'Re-sets transparent pixels to zero-alpha. In certain scenarios ' +
                  'this is useful to edit "invisible" sections of colors with alpha ' +
                  'of zero that actually have meaningful data. A sane default is to ' +
                  'leave this on when in doubt since it only affects a small percentage ' +
                  'of games/scenarios.'
                }
                placement='left-start'
              >
                <FormControlLabel
                  control={<Checkbox checked={preserveOriginAlpha} />}
                  label='Preserve origin zero-alpha pixels'
                  labelPlacement='end'
                  onChange={() => setPreserveOriginAlpha(!preserveOriginAlpha)}
                />
              </Tooltip>
            </div>
            <Divider flexItem />
            <div className='dialog-actions'>
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
            </div>
          </div>
        </div>
      </Styled>
    </>
  );
}
