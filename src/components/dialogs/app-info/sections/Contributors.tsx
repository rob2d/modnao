import { Box, Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

interface ContributorsProps {
  compact?: boolean;
}

export default function Contributors({ compact }: ContributorsProps) {
  return (
    <div className='app-info-section contributors'>
      {compact ? null : (
        <DialogSectionHeader>Contributions</DialogSectionHeader>
      )}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiTypography-subtitle1': {
            mb: 0
          },
          '& .MuiTypography-body2': {
            pl: 2,
            mb: 2
          }
        }}
      >
        <Typography variant={'subtitle1'}>
          Design&nbsp;/&nbsp;Dev&nbsp;/&nbsp;Algos
        </Typography>
        <Typography variant={'body2'}>rob2d</Typography>
        <Typography variant={'subtitle1'}>
          Various Binary Format Details
        </Typography>
        <Typography variant={'body2'}>
          VincentNL, egregiousguy, zocker-160, bankbank, TVIndustries,
          mountainmanjed
        </Typography>
        <Typography variant={'subtitle1'}>
          User Testing & Useful Feedback
        </Typography>
        <Typography variant={'body2'}>
          Magnetro2K, Paxtez, DJ Clayface, Toan, Blindfire604, derek (ateam),
          ONTortita, tengu, ViolinKen, lethalmonk6
        </Typography>
      </Box>
    </div>
  );
}
