import { Dialog, DialogContent, styled } from '@mui/material';
import AppInfo from './AppInfo';

type Props = {
  open: boolean;
  onClose?: (reason: string) => void;
};

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}
`
);

export default function AppInfoDialog({ onClose, open }: Props) {
  return (
    <StyledDialog onClose={onClose} open={open} fullWidth maxWidth='xl'>
      <DialogContent>
        <AppInfo />
      </DialogContent>
    </StyledDialog>
  );
}
