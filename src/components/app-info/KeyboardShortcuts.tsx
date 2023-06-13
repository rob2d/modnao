import { Typography, styled } from '@mui/material';

const Styled = styled('div')(() => `& {}`);

export default function KeyboardShortcuts() {
  return (
    <Styled>
      <Typography variant='subtitle1'>Keyboard Shortcuts</Typography>
      <div>Hello World</div>
    </Styled>
  );
}
