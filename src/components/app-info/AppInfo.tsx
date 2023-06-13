import { Grid } from '@mui/material';
import Contributors from './Contributors';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function AppInfo() {
  return (
    <Grid container>
      <Grid xs={12} md={4}>
        <KeyboardShortcuts />
      </Grid>
      <Grid xs={12} md={4}>
        <Contributors />
      </Grid>
    </Grid>
  );
}
