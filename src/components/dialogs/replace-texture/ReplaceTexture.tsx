import { TextureColorFormat } from '@/utils/textures';
import { mdiCropRotate, mdiMagnify, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Button,
  Divider,
  FormControlLabel,
  Slider,
  styled,
  Typography
} from '@mui/material';
import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

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

& .original-texture-img-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${theme.spacing(2)} 0;
}

& .original-texture-img-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-color: ${theme.palette.scene.background};
}

& .original-texture-img-container img {
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

}

& .result img {
  margin: ${theme.spacing(2)} 0;
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

export default function ReplaceTexture() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [croppedImage, setCroppedImage] = useState<string>();
  const originalWidth = 256;
  const originalHeight = 256;
  const textureFormat: TextureColorFormat = 'ARGB4444';
  const textureIndex = 2;

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onSetZoom = useCallback((_: Event, zoom: number | number[]) => {
    setZoom(typeof zoom !== 'number' ? zoom[0] : zoom);
  }, []);

  const onChangeRotation = useCallback(
    (_: Event, rotation: number | number[]) => {
      setRotation(typeof rotation !== 'number' ? rotation[0] : rotation);
    },
    []
  );

  return (
    <>
      <Styled>
        <div className='content'>
          <div className='replacement-setup section'>
            <Typography variant='h6'>New Source Image</Typography>
            <div className='cropper'>
              <Cropper
                image='https://img.huffingtonpost.com/asset/5c0844f11d00002c0231399a.jpeg'
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
                label={
                  <>
                    <Icon path={mdiMagnify} size={1} />
                  </>
                }
                labelPlacement='start'
                control={
                  <Slider
                    size='small'
                    min={0.1}
                    max={8}
                    step={0.1}
                    defaultValue={1}
                    aria-label='Small'
                    valueLabelDisplay='auto'
                    value={zoom}
                    onChange={onSetZoom}
                  />
                }
              />
              <Button color='primary' className='sub-control'>
                <Icon path={mdiRefresh} size={1} />
              </Button>
              <FormControlLabel
                label={
                  <>
                    <Icon path={mdiCropRotate} size={1} />
                  </>
                }
                labelPlacement='start'
                control={
                  <Slider
                    size='small'
                    min={-180}
                    max={180}
                    step={0.25}
                    defaultValue={0}
                    aria-label='Small'
                    valueLabelDisplay='auto'
                    value={rotation}
                    onChange={onChangeRotation}
                  />
                }
              />
              <Button color='primary' className='sub-control'>
                <Icon path={mdiRefresh} size={1} />
              </Button>
            </div>
          </div>
          <Divider orientation='vertical' flexItem></Divider>
          <div className='original-texture section'>
            <Typography variant='h6'>Texture Origin</Typography>
            <div className='original-texture'>
              <div className='original-texture-img-container'>
                <img
                  src='https://img.huffingtonpost.com/asset/64dc00bc2300006600cbd08b.jpg'
                  style={{
                    width: originalWidth,
                    height: originalHeight,
                    objectFit: 'cover',
                    objectPosition: '90% 10%'
                  }}
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
              <img
                src='https://img.huffingtonpost.com/asset/5c0844f11d00002c0231399a.jpeg'
                style={{
                  width: originalWidth,
                  height: originalHeight,
                  objectFit: 'cover',
                  objectPosition: '90% 10%'
                }}
              />
            </div>
            <div className='dialog-actions'>
              <Button color='secondary' variant='outlined'>
                Cancel
              </Button>
              <Button color='primary' variant='outlined'>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Styled>
    </>
  );
}
