import { Box } from '@mui/material';
import { ReactNode } from 'react';

export type Props = { children: ReactNode };
export default function DialogSectionContentCards({ children }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        px: 0,
        '& > *': {
          flexShrink: 0,
          mb: 2,
          mr: 1
        }
      }}
    >
      {children}
    </Box>
  );
}
