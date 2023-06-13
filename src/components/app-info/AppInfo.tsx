import { Grid, styled } from '@mui/material';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import DevUpdates from './sections/DevUpdates';
import OtherProjects from './sections/OtherProjects';

const StyledGrid = styled(Grid)(
  ({ theme }) => `
    & .app-info-section:not(:last-child) {
      margin-bottom: ${theme.spacing(3)}
    }
    `
);

export default function AppInfo() {
  return (
    <StyledGrid container>
      <Grid xs={12} md={4}>
        <KeyboardShortcuts />
        <SceneNavigationHints />
      </Grid>
      <Grid xs={12} md={5}>
        <Contributors />
      </Grid>
      <Grid xs={12} md={3}>
        <DevUpdates />
        <OtherProjects />
      </Grid>
    </StyledGrid>
  );
}
