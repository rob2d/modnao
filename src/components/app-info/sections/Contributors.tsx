import { Typography, styled } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';

const StyledContent = styled('div')(
  ({ theme }) => `
    & {
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    & .MuiTypography-subtitle1 {
      margin-bottom: ${theme.spacing(1)};
    }

    & .MuiTypography-h6 {
      padding-left: ${theme.spacing(3)};
      margin-bottom: ${theme.spacing(3)};
    }
    `
);

export default function Contributors() {
  return (
    <div className='app-info-section'>
      <DialogSectionHeader>Contributions</DialogSectionHeader>
      <StyledContent>
        <Typography variant={'subtitle1'}>Design/Development</Typography>
        <Typography variant={'h6'}>Rob2D</Typography>
        <Typography variant={'subtitle1'}>
          Various Model & Texture Format / R.E. Details
        </Typography>
        <Typography variant={'h6'}>
          VincentNL, egregiousguy, zocker-160, bankbank, TVIndustries,
          mountainmanjed
        </Typography>
        <Typography variant={'subtitle1'}>
          Early User Testing & Feedback
        </Typography>
        <Typography variant={'h6'}>
          Magnetro2K, Paxtez, DJ Clayface, Toan
        </Typography>
      </StyledContent>
    </div>
  );
}
