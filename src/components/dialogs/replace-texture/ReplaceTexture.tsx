import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { FormControlLabel, Slider, styled, Typography } from '@mui/material';
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

& .cropper {
  flex-grow: 1;
  position: relative;
  width: 100%;
  margin-top: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(2)};
  overflow: hidden;
  background-color: ${theme.palette.scene.background};
}

& .controls {
  display: flex;
}

& .controls .MuiSlider-root {
  min-width: 200px;
  margin-left: ${theme.spacing(2)};
}
& .controls .MuiFormControlLabel-label {
  display: flex;
  align-items: center;
}
`
);

export default function ReplaceTexture() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [croppedImage, setCroppedImage] = useState<string>();

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onSetZoom = useCallback((_: Event, zoom: number | number[]) => {
    setZoom(typeof zoom !== 'number' ? zoom[0] : zoom);
  }, []);

  return (
    <>
      <Styled>
        <Typography variant='h5'>Crop/resize image</Typography>
        <div className='cropper'>
          <Cropper
            image='https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000'
            crop={crop}
            zoom={zoom}
            minZoom={0.1}
            maxZoom={8}
            aspect={4 / 3}
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
                <span>Zoom</span>
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
          ></FormControlLabel>
        </div>
      </Styled>
    </>
  );
}
