import {
  Button,
  Link,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  styled,
  Typography
} from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';

const Styled = styled('div')(
  ({ theme }) => `& {
  
  .MuiButton-root {
    pointer-events: none;
  }

  & .highlight {
    font-weight: bold;
  }

  & .MuiTypography-root {
    text-wrap: balance;
  }

  .burger-menu-icon {
    position: relative;
    top: 6px;
  }

  .model-no-highlight {
    font-weight: bold;
    border-bottom: 2px solid ${theme.palette.secondary.main};
    margin: 0 1px;
  }
}`
);

const noop = () => undefined;

export default function GettingStarted() {
  return (
    <div className='app-info-section getting-started'>
      <DialogSectionHeader>Getting Started</DialogSectionHeader>
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
                  GDI Explorer
                </Link>
                &nbsp;and extract your .cdi/.gdi file contents of your legally
                owned and app-supported ROM file.
              </Typography>
            </StepContent>
          </Step>
          <Step key='Import Polygon and Texture Files' active={true}>
            <StepLabel>Import Polygon and/or Texture File</StepLabel>
            <StepContent>
              <Typography>
                Click&nbsp;
                <Button
                  onClick={noop}
                  color='primary'
                  size='small'
                  variant='outlined'
                >
                  Import Model/Texture
                </Button>
                &nbsp; to load a polygon and an associated texture file, or just
                a dedicated texture file by itself. Hold control when clicking
                to select multiple files.
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
                Click a polygon to highlight its texture, then hit the&nbsp;
                <Icon
                  path={mdiDotsVertical}
                  size={1}
                  className='burger-menu-icon'
                />
                &nbsp;icon. Edit the texture color sliders or replace the image.
                You can also drag a file into the right panel.
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
                  color='primary'
                  size='small'
                  variant='outlined'
                >
                  Export Textures
                </Button>
                &nbsp;to export. Rebuild your files using&nbsp;
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
