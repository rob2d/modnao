import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  IconButton,
  ListSubheader,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';
import type { AsyncState } from '@/types';

type GuiPanelSectionProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  subtitleLoadingState?: AsyncState;
  collapsedContent?: React.ReactNode;
  collapsedContentFABs?: React.ReactNode[];
  headerActions?: React.ReactNode;
};

export default function GuiPanelSection({
  children,
  title,
  subtitle,
  subtitleLoadingState,
  collapsedContent,
  collapsedContentFABs,
  headerActions
}: GuiPanelSectionProps) {
  const [isExpanded, setExpanded] = useState(true);

  const toggleContentExpanded = () =>
    setExpanded((prevExpanded) => !prevExpanded);

  let subtitleDisplayed =
    subtitleLoadingState === 'pending' ? (
      <Skeleton variant='text' width='100%' sx={{ mt: -0.5 }} />
    ) : undefined;

  if (!subtitleDisplayed && subtitle) {
    subtitleDisplayed = (
      <Typography variant='caption' sx={{ mt: -0.5 }}>
        {subtitle}
      </Typography>
    );
  }

  const FoldIcon = isExpanded ? UnfoldLessIcon : UnfoldMoreIcon;

  return (
    <>
      <ListSubheader
        sx={{
          my: 0.5,
          px: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          lineHeight: 1.5
        }}
      >
        <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant='subtitle2'>{title}</Typography>
            {subtitleDisplayed}
          </Box>
          {isExpanded ? undefined : collapsedContentFABs}
          {headerActions ? (
            <Box sx={{ mr: 0.5 }}>{headerActions}</Box>
          ) : undefined}
        </Box>
        <Tooltip title={`${isExpanded ? 'Collapse' : 'Expand'} section`}>
          <IconButton
            onClick={toggleContentExpanded}
            size='small'
            sx={{ my: -0.5 }}
          >
            <FoldIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </ListSubheader>
      {!isExpanded ? <Box sx={{ mt: 0.5 }}>{collapsedContent}</Box> : undefined}
      {!isExpanded ? undefined : children}
    </>
  );
}
