import { Typography } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <AppInfoSectionHeader>Scene Navigation</AppInfoSectionHeader>
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
