import { Typography, styled } from '@mui/material';

const Styled = styled('div')(() => `& {}`);

export default function KeyboardShortcuts() {
  return (
    <Styled>
      <Typography variant='h5'>Keyboard Shortcuts</Typography>
      <Typography variant={'body1'}>TODO</Typography>
    </Styled>
  );
}
