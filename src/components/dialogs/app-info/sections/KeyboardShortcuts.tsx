import { Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

export default function KeyboardShortcuts() {
  return (
    <div className='app-info-section'>
      <DialogSectionHeader>Shortcut Keys</DialogSectionHeader>
      <div>
        <Typography variant={'body1'}>
          <b>Left, Right</b>&nbsp;&nbsp; Toggle Model Viewed
        </Typography>
        <Typography variant={'body1'}>
          <b>Ctrl + \</b>&nbsp;&nbsp; Toggle &quot;<i>Scorsese Mode</i>&quot;
        </Typography>
      </div>
    </div>
  );
}
