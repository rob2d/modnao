import { Button, Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

const Styled = styled('div')(
  () => `& {
  .MuiButton-root {
    pointer-events: none;
  }
}`
);

const noop = () => undefined;

export default function GettingStarted() {
  return (
    <div className='app-info-section'>
      <AppInfoSectionHeader>Getting Started</AppInfoSectionHeader>
      <Styled>
        <Typography variant={'body1'}>
          (1) Use an app such as GDI Extractor to extract your .cdi/.gdi file
          contents of your legally owned Capcom vs SNK 2 or Marvel vs Capcom 2
          ROM file.
        </Typography>
        <Typography variant={'body1'}>
          (2) Click on the{' '}
          <Button
            onClick={noop}
            color='primary'
            size='small'
            variant='outlined'
          >
            Import Stage/Texture
          </Button>{' '}
          button to load a file.
        </Typography>
        <Typography variant={'body1'}>
          (2) Select any supported model file in the convention STG<i>XY</i>
          POL.BIN or DM<i>XY</i>.BIN file, optionally with an STG<i>XY</i>
          TEX.BIN or DM
          <i>XY</i>TEX.BIN files, representing the texture data associated with
          that polygon file (where <b>XY</b> here is the number of the polygon
          or texture).
        </Typography>
      </Styled>
    </div>
  );
}
