import { Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

const StyledContent = styled('div')(() => `& {}`);

export default function DevUpdates() {
  return (
    <StyledContent className='app-info-section'>
      <AppInfoSectionHeader>Dev Updates</AppInfoSectionHeader>
      <div>
        <a
          href='https://www.youtube.com/playlist?list=PLnnyx7NBPs_KhtZzHC0UiWhppDkUmzkYy'
          target='_new'
        >
          Check out the most recent updates in Vlog format... nao
        </a>
        <br />
        <Typography variant={'caption'}>
          Note: this Section is W.I.P. but your support is appreciated.
        </Typography>
      </div>
    </StyledContent>
  );
}
