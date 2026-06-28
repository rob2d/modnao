import { Box } from '@mui/material';
import type { InteractionPoint } from '@/utils/interaction';

interface SceneLassoOverlayProps {
  isActive: boolean;
  points: InteractionPoint[];
}

export default function SceneLassoOverlay({
  isActive,
  points
}: SceneLassoOverlayProps) {
  const pointList = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const fillOpacity = isActive ? 0.16 : 0.08;

  return points.length < 2 ? null : (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        '& > svg': {
          display: 'block'
        }
      }}
    >
      <svg width='100%' height='100%' aria-hidden='true'>
        <polygon
          points={pointList}
          fill='var(--mui-palette-scene-selected)'
          fillOpacity={fillOpacity}
          stroke='var(--mui-palette-scene-selected)'
          strokeDasharray='6 4'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          vectorEffect='non-scaling-stroke'
        />
        <polyline
          points={pointList}
          fill='none'
          stroke='var(--mui-palette-common-white)'
          strokeDasharray='6 4'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1}
          strokeOpacity={0.75}
          vectorEffect='non-scaling-stroke'
        />
      </svg>
    </Box>
  );
}
