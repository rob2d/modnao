import { Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

const Styled = styled('div')(() => `& {}`);

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <AppInfoSectionHeader>Keyboard Shortcuts</AppInfoSectionHeader>
      <Styled>
        <Typography variant={'body1'}>TODO</Typography>
      </Styled>
    </div>
  );
}
