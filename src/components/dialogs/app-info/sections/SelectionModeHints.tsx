import { Box, Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

const selectionModes = [
  {
    label: 'Mesh',
    description: 'Work with whole model pieces.'
  },
  {
    label: 'Polygon',
    description: 'Isolate faces for closer inspection.'
  },
  {
    label: 'Vertex',
    description: 'Edit color at individual points.'
  }
];

export default function SelectionModeHints() {
  return (
    <div className='app-info-section'>
      <DialogSectionHeader>Selection Modes</DialogSectionHeader>
      <Box sx={{ display: 'grid', rowGap: 0.75 }}>
        {selectionModes.map(({ label, description }) => (
          <Typography key={label} variant='body1'>
            <b>{label}</b>&nbsp;&nbsp; {description}
          </Typography>
        ))}
        <Typography variant='body1' sx={{ mt: 0.75 }}>
          <b>Vertex Controls</b>&nbsp;&nbsp; Press <b>C</b> for camera, <b>V</b>
          &nbsp;for lasso select. Use select all or clear to refine the set.
        </Typography>
      </Box>
    </div>
  );
}
