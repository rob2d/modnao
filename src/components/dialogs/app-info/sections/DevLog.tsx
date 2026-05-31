import { useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Box } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import DialogSectionContentCards from '../../DialogSectionContentCards';
import DevUpdateCard from '../DevUpdateCard';
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

export default function DevLog() {
  const [vlogs, vlogApiError] = useVlogApi();
  const { containerRef, hasScrollAbove, hasScrollBelow, scrollEdgeStyle } =
    useScrollEdges<HTMLDivElement>();

  const vlogContent = vlogApiError
    ? 'Failed to fetch vlogs'
    : !vlogs?.length
      ? Array(10)
          .fill(0)
          .map((_, i) => (
            <DevUpdateCard key={i} loadingState='pending' showImage />
          ))
      : (vlogs || []).map((v: Vlog) => (
          <DevUpdateCard
            key={v.id}
            imageAlt={`Watch ${v.vlogNumber} now`}
            imageUrl={v.thumbnailUrl}
            onClick={() =>
              window.open(`http://www.youtube.com/watch?v=${v.id}`, 'new')
            }
            subtitle={dayjs(v.publishedAt).format('MMM Do, YYYY')}
            title={v.title}
          />
        ));

  return (
    <Box
      className='app-info-section dev-vlog scroll-body'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <DialogSectionHeader>Dev Updates</DialogSectionHeader>
      <DialogSectionContentCards
        containerRef={containerRef}
        hasScrollAbove={hasScrollAbove}
        hasScrollBelow={hasScrollBelow}
        scrollEdgeStyle={scrollEdgeStyle}
      >
        {vlogContent}
      </DialogSectionContentCards>
    </Box>
  );
}
