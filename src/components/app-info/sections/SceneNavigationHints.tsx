import { Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';

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
          <b>Mousewheel</b>&nbsp;&nbsp; Zoom camera
        </Typography>
        <Typography
          variant={'body1'}
          alignItems={'center'}
          display={'inline-flex'}
          marginTop={1}
        >
          <Icon path={mdiInformationOutline} size={1} />
          &nbsp;&nbsp;Displays this info.
        </Typography>
      </div>
    </div>
  );
}
