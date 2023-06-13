import { Typography, styled } from '@mui/material';
import { ReactNode } from 'react';

const StyledTypography = styled(Typography)(
  ({ theme }) => `
    & { margin-bottom: ${theme.spacing(3)}; }`
);

type Props = { children: ReactNode };
export default function AppInfoSectionHeader({ children }: Props) {
  return <StyledTypography variant='h5'>{children}</StyledTypography>;
}
