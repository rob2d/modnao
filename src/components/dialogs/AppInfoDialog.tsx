import AppDialog from './AppDialog';
import AppInfo from './app-info/AppInfo';
import { DialogFunctionality } from '@/hooks/useDialog';

export default function AppInfoDialog({ shown, onClose }: DialogFunctionality) {
  return (
    <AppDialog open={shown} onClose={onClose} fullWidth>
      <AppInfo onCloseDialog={onClose} />
    </AppDialog>
  );
}
