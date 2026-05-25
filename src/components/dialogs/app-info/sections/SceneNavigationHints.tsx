import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
          <b>Mousewheel</b>&nbsp;&nbsp; Zoom camera
        </Typography>
        <Typography
          variant={'body1'}
          alignItems={'center'}
          display={'flex'}
          marginTop={1}
        >
          <InfoOutlinedIcon fontSize='small' />
          &nbsp;&nbsp;Displays this info.
        </Typography>
      </div>
    </div>
  );
}
