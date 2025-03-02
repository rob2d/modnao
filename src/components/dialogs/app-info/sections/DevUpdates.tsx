import { useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  ButtonBase,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  styled,
  Typography
} from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import DialogSectionContentCards from '../../DialogSectionContentCards';
import { useClientEffect } from '@/hooks';
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

const StyledContent = styled('div')(
  ({ theme }) => `
& {
  display: flex;
  flex-direction: column;
}

& .MuiButtonBase-root {
  width: 100%;
}

& .vlog-entry {
  width: 100%;
  height: auto;
}

& .MuiCard-root {
  display: flex; 
}

& .MuiCardContent-root {
  display: flex;
  flex-direction: column;
  flex-basis: 85%;
  text-align: left;
}

& .MuiCardMedia-root {
  width: 15%; 
  height: 100%;
}

${theme.breakpoints.down('md')} {
  & .vlog-entry-image {
    display: none;
  }

  & .MuiCardContent-root {
    flex-basis: 100%;
  }
}
`
);

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

export default function DevUpdates() {
  const [vlogs, vlogApiError] = useVlogApi();

  const vlogContent = vlogApiError
    ? 'Failed to fetch vlogs'
    : !vlogs?.length
      ? Array(10)
          .fill(0)
          .map((_, i) => (
            <Card key={i} elevation={2}>
              <CardContent>
                <Typography component='div' variant='subtitle1'>
                  <Skeleton height={60} />
                </Typography>
                <Typography
                  variant='subtitle1'
                  color='text.secondary'
                  component='div'
                >
                  <Skeleton />
                </Typography>
              </CardContent>
              <Skeleton variant='rectangular' width={100} height={120} />
            </Card>
          ))
      : (vlogs || []).map((v: Vlog) => (
          <Card key={v.id} elevation={2}>
            <ButtonBase
              onClick={() =>
                window.open(`http://www.youtube.com/watch?v=${v.id}`, 'new')
              }
            >
              <CardContent>
                <Typography component='div' variant='subtitle1'>
                  {v.title}
                </Typography>
                <Typography
                  variant='subtitle1'
                  color='text.secondary'
                  component='div'
                >
                  {dayjs(v.publishedAt).format('MMM Do, YYYY')}
                </Typography>
              </CardContent>
              <CardMedia
                component='img'
                image={`${v.thumbnailUrl}`}
                alt={`Watch ${v.vlogNumber} now`}
                className={'vlog-entry-image'}
              />
            </ButtonBase>
          </Card>
        ));

  return (
    <StyledContent className='app-info-section dev-updates scroll-body'>
      <DialogSectionHeader>Dev Updates / Vlog</DialogSectionHeader>
      <DialogSectionContentCards>{vlogContent}</DialogSectionContentCards>
    </StyledContent>
  );
}
