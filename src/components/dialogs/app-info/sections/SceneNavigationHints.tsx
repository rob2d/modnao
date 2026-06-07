import { Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VideocamIcon from '@mui/icons-material/Videocam';
import DialogSectionHeader from '../../DialogSectionHeader';

export default function SceneNavigationHints() {
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 1,
            rowGap: 1,
            alignItems: 'start',
            mt: 1
          }}
        >
          <InfoOutlinedIcon fontSize='small' sx={{ mt: '2px' }} />
          <Typography variant={'body1'}>Displays this info.</Typography>
          <VideocamIcon fontSize='small' sx={{ mt: '2px' }} />
          <Typography variant={'body1'}>
            Enables &quot;Cinematic Mode&quot; - hides interface and shows hints
            for browsed objects.
          </Typography>
        </Box>
      </div>
    </div>
  );
}
