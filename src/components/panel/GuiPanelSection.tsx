import { useCallback, useState } from 'react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import {
  IconButton,
  ListSubheader,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';
import Icon from '@mdi/react';
import type { AsyncState } from '@/types';

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  subtitleLoadingState?: AsyncState;
  collapsedContent?: React.ReactNode;
  collapsedContentFABs?: React.ReactNode[];
};

export default function GuiPanelSection({
  children,
  title,
  subtitle,
  subtitleLoadingState,
  collapsedContent,
  collapsedContentFABs
}: Props) {
  const [isExpanded, setExpanded] = useState(true);

  const toggleContentExpanded = useCallback(
    () => setExpanded((prevExpanded) => !prevExpanded),
    []
  );

  let subtitleDisplayed =
    subtitleLoadingState === 'pending' ? (
      <Skeleton variant='text' width='100%' />
    ) : undefined;

  if (!subtitleDisplayed && subtitle) {
    subtitleDisplayed = <Typography variant='caption'>{subtitle}</Typography>;
  }

  return (
    <>
      <ListSubheader
        sx={{
          mt: 1,
          px: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          lineHeight: 1.5,
          '& .header-text': {
            display: 'flex',
            flexDirection: 'column'
          },
          '& + .collapsed-content': {
            mt: 1
          }
        }}
      >
        <div className='header-text'>
          <Typography variant='subtitle2'>{title}</Typography>
          {subtitleDisplayed}
        </div>
        {isExpanded ? undefined : collapsedContentFABs}
        <Tooltip title={`${isExpanded ? 'Collapse' : 'Expand'} section`}>
          <IconButton onClick={toggleContentExpanded}>
            <Icon
              path={
                !isExpanded ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal
              }
              size={1}
            />
          </IconButton>
        </Tooltip>
      </ListSubheader>
      {!isExpanded ? (
        <div className='collapsed-content'>{collapsedContent}</div>
      ) : undefined}
      {!isExpanded ? undefined : children}
    </>
  );
}
