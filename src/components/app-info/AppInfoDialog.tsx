import { Dialog, DialogTitle } from '@mui/material';
import AppInfo from './AppInfo';

type Props = {
  open: boolean;
  onClose?: (reason: string) => void;
};

export default function AppInfoDialog({ onClose, open }: Props) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>ModNao</DialogTitle>
      <AppInfo />
    </Dialog>
  );
}
