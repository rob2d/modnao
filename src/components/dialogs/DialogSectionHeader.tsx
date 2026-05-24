import { Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = { children: ReactNode };
export default function DialogSectionHeader({ children }: Props) {
  return (
    <Typography
      variant='h6'
      className='section-header'
      sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
    >
      {children}
    </Typography>
  );
}
