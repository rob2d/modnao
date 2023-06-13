import { Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

const StyledContent = styled('div')(() => `& {}`);

export default function DevUpdates() {
  return (
    <StyledContent className='app-info-section'>
      <AppInfoSectionHeader>Dev Updates</AppInfoSectionHeader>
      <div>
        <Typography variant={'h6'}>W.I.P.</Typography>
      </div>
    </StyledContent>
  );
}
