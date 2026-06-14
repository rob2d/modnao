import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

export default function GuiPanelActionButtonRow({
  children
}: PropsWithChildren) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        columnGap: 1,
        [`@container (max-width: ${theme.mixins.guiPanelExpansionL1W})`]: {
          flexDirection: 'column'
        }
      })}
    >
      {children}
    </Box>
  );
}
