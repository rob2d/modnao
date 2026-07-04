import { useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Box } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import DialogSectionContentCards from '../../DialogSectionContentCards';
import XUpdateCard from '../XUpdateCard';
import YTUpdateCard from '../YTUpdateCard';
import { type XUpdate, xUpdates } from '../devUpdates';
import { useClientEffect } from '@/hooks';
import { useScrollEdges } from '@/hooks';
dayjs.extend(advancedFormat);

type Vlog = {
  id: string;
  vlogNumber: number;
  videoTitle: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
};

interface VlogTimelineItem {
  kind: 'vlog';
  publishedAt: string;
  vlog: Vlog;
}

interface XUpdateTimelineItem {
  kind: 'xUpdate';
  publishedAt: string;
  update: XUpdate;
}

type TimelineItem = VlogTimelineItem | XUpdateTimelineItem;

interface DevLogProps {
  compact?: boolean;
}

const origin =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

const useVlogApi = () => {
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useClientEffect(() => {
    const fetchData = async () => {
      const response = await (await fetch(`${origin}/api/vlogs`)).json();
      if (Array.isArray(response)) {
        setVlogs(response);
      }

      if (response.error) {
        setError('Failed to fetch vlogs');
      }
    };

    fetchData();
  }, []);

  return [vlogs, error] as [Vlog[], string | undefined];
};

export default function DevLog({ compact }: DevLogProps) {
  const [vlogs, vlogApiError] = useVlogApi();
  const { containerRef, hasScrollAbove, hasScrollBelow, scrollEdgeStyle } =
    useScrollEdges<HTMLDivElement>();

  const timelineItems: TimelineItem[] = [
    ...xUpdates.map(
      (update): TimelineItem => ({
        kind: 'xUpdate',
        publishedAt: update.publishedAt,
        update
      })
    ),
    ...vlogs.map(
      (vlog): TimelineItem => ({
        kind: 'vlog',
        publishedAt: vlog.publishedAt,
        vlog
      })
    )
  ].sort(
    (firstUpdate, secondUpdate) =>
      dayjs(secondUpdate.publishedAt).valueOf() -
      dayjs(firstUpdate.publishedAt).valueOf()
  );

  const timelineContent = vlogApiError
    ? 'Failed to fetch vlogs'
    : !vlogs.length
      ? Array(10)
          .fill(0)
          .map((_, i) => (
            <YTUpdateCard key={i} loadingState='pending' showImage />
          ))
      : timelineItems.map((timelineItem) =>
          timelineItem.kind === 'xUpdate' ? (
            <XUpdateCard
              key={`${timelineItem.publishedAt}-${timelineItem.update.parts[0]?.url}`}
              {...timelineItem.update}
            />
          ) : (
            <YTUpdateCard
              key={timelineItem.vlog.id}
              imageAlt={`Watch ${timelineItem.vlog.vlogNumber} now`}
              imageUrl={timelineItem.vlog.thumbnailUrl}
              onClick={() =>
                window.open(
                  `http://www.youtube.com/watch?v=${timelineItem.vlog.id}`,
                  'new'
                )
              }
              subtitle={dayjs(timelineItem.vlog.publishedAt).format(
                'MMM Do, YYYY'
              )}
              title={timelineItem.vlog.title}
            />
          )
        );

  return (
    <Box
      className='app-info-section dev-vlog scroll-body'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      {compact ? null : <DialogSectionHeader>Dev Updates</DialogSectionHeader>}
      <DialogSectionContentCards
        containerRef={containerRef}
        hasScrollAbove={hasScrollAbove}
        hasScrollBelow={hasScrollBelow}
        scrollEdgeStyle={scrollEdgeStyle}
      >
        {timelineContent}
      </DialogSectionContentCards>
    </Box>
  );
}
