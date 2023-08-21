import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Image } from 'image-js';
import Img from 'next/image';
import {
  mdiCropRotate,
  mdiFlipHorizontal,
  mdiFlipVertical,
  mdiMagnify,
  mdiRefresh
} from '@mdi/js';
import Icon from '@mdi/react';
import { nanoid } from 'nanoid';
import {
  Button,
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
  selectTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { TextureColorFormat } from '@/utils/textures';
import { objectUrlToBuffer } from '@/utils/data';
import { useDebouncedEffect } from '@/hooks';
import cropImage from '@/utils/images/cropImage';
import { applyReplacedTextureImage } from '@/store/replaceTextureSlice';
import { NLTextureDef } from '@/types/NLAbstractions';

const Styled = styled('div')(
  ({ theme }) => `
& {
  display: flex;
  flex-direction: column;
  height: 80vh;
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

& .section {
  display: flex;
  flex-direction: column;
}

& .replacement-setup {
  flex-grow: 6;
}

& .original-texture {
  flex-shrink: 0;
}

& .texture-img-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${theme.spacing(2)} 0;
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
}

& .controls .MuiSlider-root {
  min-width: 120px;
  margin-left: ${theme.spacing(2)};
}

& .controls .MuiFormControlLabel-label {
  display: flex;
  align-items: center;
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
`
);

const DEFAULT_FLIP_STATE = { horizontal: false, vertical: false };

export default function ReplaceTexture() {
  const dispatch = useAppDispatch();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imageDataUrl, setImageDataUrl] = useState(() => '');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [croppedImage, setCroppedImage] = useState('');
  const [flip, setFlip] = useState(() => DEFAULT_FLIP_STATE);

  const textureFormat: TextureColorFormat = 'ARGB4444';

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

  const onCancelReplaceTexture = useCallback(() => {
    dispatch(closeDialog());
  }, [dispatch]);

  const onApplyReplaceTexture = useCallback(() => {
    dispatch(applyReplacedTextureImage(croppedImage));
  }, [croppedImage, dispatch]);

  const textureDefs: NLTextureDef[] = useAppSelector(selectTextureDefs);
  const textureIndex = useAppSelector(selectReplacementTextureIndex);
  const replacementImage = useAppSelector(selectReplacementImage);
  const originalWidth = textureDefs?.[textureIndex]?.width || 0;
  const originalHeight = textureDefs?.[textureIndex]?.height || 0;

  const referenceTextureStyle = useMemo(
    () => ({
      width: Math.min(originalWidth, 256),
      height: Math.min(originalHeight, 256)
    }),
    [originalWidth, originalHeight]
  );
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

  const updateId = useMemo(
    () => nanoid(),
    [
      imageDataUrl,
      originalWidth,
      originalHeight,
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
        const resizedImage = (await Image.load(nextCroppedImage))
          .resize({
            width: originalWidth,
            height: originalHeight
          })
          .toDataURL();

        setCroppedImage(resizedImage);
      })();
    },
    [updateId],
    200
  );

  const originTextureDataUrl =
    textureDefs?.[textureIndex]?.dataUrls?.opaque || '';

  return (
    <>
      <Styled>
        <div className='content'>
          <div className='replacement-setup section'>
            <Typography variant='h6'>New Source Image</Typography>
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
              <Tooltip title='Flip image horizontally (appears on result/preview)'>
                <Button color='primary' onClick={onFlipHorizontal}>
                  <Icon path={mdiFlipHorizontal} size={1} />
                </Button>
              </Tooltip>
              <Tooltip title='Flip image vertically (appears on result/preview)'>
                <Button color='primary' onClick={onFlipVertical}>
                  <Icon path={mdiFlipVertical} size={1} />
                </Button>
              </Tooltip>
            </div>
          </div>
          <Divider orientation='vertical' flexItem></Divider>
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
            </div>
            <Divider flexItem />
            <div className='result'>
              <Typography variant='h6'>Result</Typography>
              <div className='texture-img-container'>
                <Img
                  alt='Resulting texture after modifications'
                  src={croppedImage}
                  width={originalWidth}
                  height={originalHeight}
                  style={referenceTextureStyle}
                />
              </div>
            </div>
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
