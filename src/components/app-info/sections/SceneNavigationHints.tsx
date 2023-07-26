import { Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <DialogSectionHeader>Scene Navigation</DialogSectionHeader>
      <div>
        <Typography variant={'body1'}>
          <b>Mouse Click & Drag</b>&nbsp;&nbsp; Rotate Camera
        </Typography>
        <Typography variant={'body1'}>
          <b>Shift + Mouse Drag</b>&nbsp;&nbsp; Pan Camera
        </Typography>
        <Typography variant={'body1'}>
          <b>Mousewheel</b>&nbsp;&nbsp; Move camera forward/backward
        </Typography>
      </div>
    </div>
  );
}
