import { Typography, styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';

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
      <AppInfoSectionHeader>Contributions</AppInfoSectionHeader>
      <StyledContent>
        <Typography variant={'subtitle1'}>Design/Development</Typography>
        <Typography variant={'h6'}>Rob2D</Typography>
        <Typography variant={'subtitle1'}>
          Various Model & Texture Format / R.E. Details
        </Typography>
        <Typography variant={'h6'}>
          VincentNL, egregiousguy, zocker-160, <br />
          mountainmanjed, bankbank
        </Typography>
        <Typography variant={'subtitle1'}>
          Early User Testing & Feedback
        </Typography>
        <Typography variant={'h6'}>Magnetro2K</Typography>
      </StyledContent>
    </div>
  );
}
