import { Dialog, DialogContent, styled } from '@mui/material';

type Props = {
  open: boolean;
  onClose?: (reason: string) => void;
  children: React.ReactNode;
  fullWidth?: boolean;
};

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}
`
);

export default function AppDialog({
  onClose,
  open,
  children,
  fullWidth
}: Props) {
  return (
    <StyledDialog
      onClose={onClose}
      open={open}
      fullWidth={fullWidth}
      maxWidth='xl'
    >
      <DialogContent>{children}</DialogContent>
    </StyledDialog>
  );
}
