import { Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

const Styled = styled('div')(() => `& {}`);

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <AppInfoSectionHeader>Keyboard Shortcuts</AppInfoSectionHeader>
      <Styled>
        <Typography variant={'body1'}>
          <b>Left, Right</b>&nbsp;&nbsp; Toggle Model Viewed
        </Typography>
        <Typography variant={'body1'}>
          <b>Ctrl + \</b>&nbsp;&nbsp; Toggle Gui Panel Visibility
        </Typography>
      </Styled>
    </div>
  );
}
