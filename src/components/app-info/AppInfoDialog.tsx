import { Dialog, DialogContent } from '@mui/material';
import AppInfo from './AppInfo';

type Props = {
  open: boolean;
  onClose?: (reason: string) => void;
};

export default function AppInfoDialog({ onClose, open }: Props) {
  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth='xl'>
      <DialogContent>
        <AppInfo />
      </DialogContent>
    </Dialog>
  );
}
