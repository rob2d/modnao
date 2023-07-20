import {
  Button,
  Link,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  styled
} from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';

const Styled = styled('div')(
  () => `& {
  .MuiButton-root {
    pointer-events: none;
  }

  & .burger-menu-icon {
    position: relative;
    top: 6px;
  }
}`
);

const noop = () => undefined;

export default function GettingStarted() {
  return (
    <div className='app-info-section'>
      <AppInfoSectionHeader>Getting Started</AppInfoSectionHeader>
      <Styled>
        <Stepper orientation='vertical' nonLinear>
          <Step key='Extract Game Files' active={true}>
            <StepLabel>Extract Game Files</StepLabel>
            <StepContent>
              <Typography>
                Download&nbsp;
                <Link
                  href='https://www.romhacking.net/utilities/1459/'
                  target='_new'
                >
                  GDI Extractor
                </Link>
                &nbsp;and extract your .cdi/.gdi file contents of your legally
                owned Capcom vs SNK 2 or Marvel vs Capcom 2 ROM file.
              </Typography>
            </StepContent>
          </Step>
          <Step key='Import Polygon and Texture Files' active={true}>
            <StepLabel>Import Polygon and Texture Files</StepLabel>
            <StepContent>
              <Typography>
                Click on the&nbsp;
                <Button
                  onClick={noop}
                  color='primary'
                  size='small'
                  variant='outlined'
                >
                  Import Model/Texture
                </Button>
                &nbsp; button to load a polygon and an optional associated
                texture file.
              </Typography>
              <Typography>
                Supported model files are in the format: &quot;STG
                <i>XY</i>
                POL.BIN&quot; or &quot;DM<i>XY</i>.BIN&quot;. Texture files are
                in format of &quot;STG<i>XY</i>TEX.BIN&quot; or &quot;DM
                <i>XY</i>TEX.BIN&quot;. <b>XY</b> refers to the number of the
                polygon, or texture. Hold control + click to select multiple
                files.
              </Typography>
            </StepContent>
          </Step>
          <Step key='Navigate Models and Edit Textures' active={true}>
            <StepLabel>Browse Models and Edit Textures</StepLabel>
            <StepContent>
              <Typography>
                Browse Models using arrow keys or model navigation buttons.
              </Typography>
              <Typography>
                Click a polygon to highlight its texture. On the textures, there
                will be a&nbsp;
                <Icon
                  path={mdiDotsVertical}
                  size={1}
                  className='burger-menu-icon'
                />
                &nbsp;button. Use the texture color sliders or replace the image
                with one of equal-size.
              </Typography>
            </StepContent>
          </Step>
          <Step key='Export Textures and Build' active={true}>
            <StepLabel>Export Textures and Build</StepLabel>
            <StepContent>
              <Typography>
                Once textures are edited, click&nbsp;
                <Button
                  onClick={noop}
                  color='secondary'
                  size='small'
                  variant='outlined'
                >
                  Export Textures
                </Button>
                &nbsp; to export. Rebuild your files using&nbsp;
                <Link
                  href='https://projects.sappharad.com/tools/gdibuilder13_win32.zip'
                  target='_new'
                >
                  GDI Builder
                </Link>
                .
              </Typography>
            </StepContent>
          </Step>
        </Stepper>
      </Styled>
    </div>
  );
}
