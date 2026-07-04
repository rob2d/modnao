import { Box } from '@mui/material';
import { useScrollEdges } from '@/hooks';
import Contributors from './sections/Contributors';
import KeyboardShortcuts from './sections/KeyboardShortcuts';
import SceneNavigationHints from './sections/SceneNavigationHints';
import SelectionModeHints from './sections/SelectionModeHints';

interface AppInfoGuideProps {
  includeContributors?: boolean;
}

export default function AppInfoGuide({
  includeContributors
}: AppInfoGuideProps) {
  const { containerRef, hasScrollAbove, hasScrollBelow, scrollEdgeStyle } =
    useScrollEdges<HTMLDivElement>();

  return (
    <Box
      className='app-info-section'
      data-scroll-above={hasScrollAbove}
      data-scroll-below={hasScrollBelow}
      style={scrollEdgeStyle}
      sx={(theme) => ({
        ...theme.mixins.dialogScrollEdgeFrame,
        gridRowStart: { lg: 1 },
        gridRowEnd: { lg: 4 },
        '& .MuiDivider-root': {
          mb: 2
        }
      })}
    >
      <Box
        ref={containerRef}
        sx={(theme) => theme.mixins.dialogScrollEdgeScroller}
      >
        <KeyboardShortcuts />
        <SceneNavigationHints />
        <SelectionModeHints />
        {!includeContributors ? null : <Contributors />}
      </Box>
    </Box>
  );
}
