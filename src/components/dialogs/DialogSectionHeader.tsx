import { styled, Typography } from '@mui/material';
import { ReactNode } from 'react';

const StyledTypography = styled(Typography)(
  ({ theme }) => `
    & { 
      display: flex;
      align-items: center;
      margin-bottom: ${theme.spacing(2)}; 
    }`
);

type Props = { children: ReactNode };
export default function DialogSectionHeader({ children }: Props) {
  return (
    <StyledTypography variant='h6' className='section-header'>
      {children}
    </StyledTypography>
  );
}
