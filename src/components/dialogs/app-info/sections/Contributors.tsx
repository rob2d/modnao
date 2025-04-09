import { styled, Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

const StyledContent = styled('div')(
  ({ theme }) => `
    & {
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    & .MuiTypography-subtitle1 {
      margin-bottom: 0;
    }

    & .MuiTypography-body2 {
      padding-left: ${theme.spacing(2)};
      margin-bottom: ${theme.spacing(2)};
    }
    `
);

export default function Contributors() {
  return (
    <div className='app-info-section contributors'>
      <DialogSectionHeader>Contributions</DialogSectionHeader>
      <StyledContent>
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
        <Typography variant={'subtitle1'}>User Testing & Feedback</Typography>
        <Typography variant={'body2'}>
          Magnetro2K, Paxtez, DJ Clayface, Toan, Blindfire604, derek (ateam),
          ONTortita, tengu
        </Typography>
      </StyledContent>
    </div>
  );
}
