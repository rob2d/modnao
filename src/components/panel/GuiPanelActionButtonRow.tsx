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
        '.welcome &': {
          flexDirection: 'column'
        },
        columnGap: 1,
        [`@container (max-width: ${theme.mixins.guiPanelExpansionL1W})`]: {
          flexDirection: 'column'
        },
        '& > *': {
          width: '100%',
          alignSelf: 'stretch'
        }
      })}
    >
      {children}
    </Box>
  );
}
