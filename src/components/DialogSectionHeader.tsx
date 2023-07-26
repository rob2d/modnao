import { Typography, styled } from '@mui/material';
import { ReactNode } from 'react';

const StyledTypography = styled(Typography)(
  ({ theme }) => `
    & { 
      display: flex;
      align-items: center;
      margin-bottom: ${theme.spacing(3)}; 
    }`
);

type Props = { children: ReactNode };
export default function DialogSectionHeader({ children }: Props) {
  return <StyledTypography variant='h5'>{children}</StyledTypography>;
}
