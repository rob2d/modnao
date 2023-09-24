import { styled, Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

const Styled = styled('div')(() => `& {}`);

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <DialogSectionHeader>Shortcut Keys</DialogSectionHeader>
      <Styled>
        <Typography variant={'body1'}>
          <b>Left, Right</b>&nbsp;&nbsp; Toggle Model Viewed
        </Typography>
        <Typography variant={'body1'}>
          <b>Ctrl + \</b>&nbsp;&nbsp; Toggle Interface Visibility
        </Typography>
      </Styled>
    </div>
  );
}
