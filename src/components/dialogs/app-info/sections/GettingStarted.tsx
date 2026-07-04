import {
  Box,
  Button,
  Link,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DialogSectionHeader from '../../DialogSectionHeader';
import { useScrollEdges } from '@/hooks';

const noop = () => undefined;

interface GettingStartedProps {
  compact?: boolean;
}

export default function GettingStarted({ compact }: GettingStartedProps) {
  const { containerRef, hasScrollAbove, hasScrollBelow, scrollEdgeStyle } =
    useScrollEdges<HTMLDivElement>();

  return (
    <Box
      className='app-info-section getting-started'
      data-scroll-above={hasScrollAbove}
      data-scroll-below={hasScrollBelow}
      style={scrollEdgeStyle}
      sx={(theme) => theme.mixins.dialogScrollEdgeFrame}
    >
      <Box
        ref={containerRef}
        sx={(theme) => theme.mixins.dialogScrollEdgeScroller}
      >
        {compact ? null : (
          <DialogSectionHeader>Getting Started</DialogSectionHeader>
        )}
        <Box
          sx={{
            '& .MuiButton-root': {
              pointerEvents: 'none'
            },
            '& .highlight': {
              fontWeight: 'bold'
            },
            '& .MuiTypography-root': {
              textWrap: 'balance'
            },
            '& .burger-menu-icon': {
              position: 'relative',
              top: '3px'
            },
            '& .model-no-highlight': {
              fontWeight: 'bold',
              borderBottom: '2px solid var(--mui-palette-secondary-main)',
              mx: '1px'
            }
          }}
        >
          <Stepper orientation='vertical' nonLinear>
            <Step key='Extract Game Files' active={true}>
              <StepLabel>Extract Game Files</StepLabel>
              <StepContent>
                <Typography>
                  {'Download '}
                  <Link
                    href='https://www.romhacking.net/utilities/1459/'
                    target='_new'
                  >
                    GDI Explorer
                  </Link>
                  {
                    ' and extract your .cdi/.gdi file contents of your legally owned and app-supported ROM file.'
                  }
                </Typography>
              </StepContent>
            </Step>
            <Step key='Import Polygon and Texture Files' active={true}>
              <StepLabel>Import Polygon and/or Texture File</StepLabel>
              <StepContent>
                <Typography>
                  {'Click '}
                  <Button
                    onClick={noop}
                    color='primary'
                    size='small'
                    variant='outlined'
                    sx={{ lineHeight: 1, mr: 1 }}
                  >
                    Import Model/Texture
                  </Button>
                  {
                    ' to load a polygon and an associated texture file, or just a dedicated texture file by itself. Hold control when clicking to select multiple files.'
                  }
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
                  {'Click a polygon to highlight its texture, then hit the '}
                  <MoreVertIcon fontSize='small' className='burger-menu-icon' />
                  {
                    ' icon. Edit the texture color sliders or replace the image. You can also drag a file into the right panel.'
                  }
                </Typography>
              </StepContent>
            </Step>
            <Step key='Export Textures' active={true}>
              <StepLabel>Export Textures</StepLabel>
              <StepContent>
                <Typography>
                  {'Once textures are edited, click '}
                  <Button
                    onClick={noop}
                    color='primary'
                    size='small'
                    variant='outlined'
                    sx={{ lineHeight: 1 }}
                  >
                    Export Textures
                  </Button>
                  {' to download the updated texture files.'}
                </Typography>
              </StepContent>
            </Step>
            <Step key='Export Edited Polygon File' active={true}>
              <StepLabel>Export Edited Polygon File</StepLabel>
              <StepContent>
                <Typography>
                  {"If you've edited vertex colors, click "}
                  <Button
                    onClick={noop}
                    color='secondary'
                    size='small'
                    variant='outlined'
                    sx={{ lineHeight: 1 }}
                  >
                    EXPORT MODELS
                  </Button>
                  {' to download the polygon file with those edits.'}
                </Typography>
              </StepContent>
            </Step>
            <Step key='Rebuild Game Files' active={true}>
              <StepLabel>Rebuild Game Files</StepLabel>
              <StepContent>
                <Typography>
                  {'Rebuild your edited files using '}
                  <Link
                    href='https://projects.sappharad.com/tools/gdibuilder13_win32.zip'
                    target='_new'
                  >
                    GDI Builder
                  </Link>
                  {'.'}
                </Typography>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </Box>
    </Box>
  );
}
