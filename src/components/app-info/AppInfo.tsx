import { Grid, styled } from '@mui/material';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';

const StyledGrid = styled(Grid)(
  ({ theme }) => `
    & .app-info-section:not(:last-child) {
      margin-bottom: ${theme.spacing(3)}
    }`
);

export default function AppInfo() {
  return (
    <StyledGrid container spacing={8}>
      <Grid item xs={12} md={4}>
        <GettingStarted />
        <KeyboardShortcuts />
        <SceneNavigationHints />
      </Grid>
      <Grid item xs={12} md={4}>
        <DevUpdates />
        <OtherProjects />
      </Grid>
      <Grid item xs={12} md={4}>
        <Contributors />
      </Grid>
    </StyledGrid>
  );
}
