import { Box, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { CSSProperties, ReactNode, RefObject } from 'react';

export interface DialogSectionContentCardsProps {
  children: ReactNode;
  className?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  hasScrollAbove?: boolean;
  hasScrollBelow?: boolean;
  scrollEdgeStyle?: CSSProperties;
  sx?: SystemStyleObject<Theme>;
}

export default function DialogSectionContentCards({
  children,
  className,
  containerRef,
  hasScrollAbove,
  hasScrollBelow,
  scrollEdgeStyle,
  sx
}: DialogSectionContentCardsProps) {
  return (
    <Box
      className={className}
      data-scroll-above={hasScrollAbove}
      data-scroll-below={hasScrollBelow}
      style={scrollEdgeStyle}
      sx={(theme) => ({
        ...theme.mixins.dialogScrollEdgeFrame,
        flex: 1,
        minHeight: 0,
        ...sx
      })}
    >
      <Box
        ref={containerRef}
        sx={(theme) => ({
          ...theme.mixins.dialogScrollEdgeScroller,
          display: 'flex',
          flexDirection: 'column',
          px: 0,
          '& > *': {
            flexShrink: 0,
            mb: 2,
            mr: 1
          }
        })}
      >
        {children}
      </Box>
    </Box>
  );
}
