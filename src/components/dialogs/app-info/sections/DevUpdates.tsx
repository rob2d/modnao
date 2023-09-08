import { useEffect, useState } from 'react';
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
import DialogSectionHeader from '../../../DialogSectionHeader';
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

& .loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

& .MuiButtonBase-root {
  width: 100%;
}

& .vlog-entry {
  width: 100%;
  height: auto;
}

& .vlog-entry-iframe {
  width: 100%;
  height: auto;
}

& > div:nth-of-type(2) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 0 ${theme.spacing(1)};
}

& .MuiCard-root {
  display: flex; 
  margin-bottom: ${theme.spacing(2)};
  margin-left: ${theme.spacing(1)};
  margin-right: ${theme.spacing(1)};
  flex-shrink: 0;
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
`
);

const origin =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

let hasFetched = false;
const useVlogApi = () => {
  const [vlogs, setVlogs] = useState<Vlog[] | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      const response = await (await fetch(`${origin}/api/vlogs`)).json();
      setVlogs(response);
      hasFetched = true;
    };

    if (!hasFetched) {
      fetchData();
    }

    return () => {
      hasFetched = false;
    };
  }, []);

  return vlogs;
};

export default function DevUpdates() {
  const vlogs = useVlogApi();

  return (
    <StyledContent className='app-info-section'>
      <DialogSectionHeader>Dev Updates / Vlog</DialogSectionHeader>
      <div>
        {!vlogs
          ? [1, 2, 3, 4, 5, 6].map((_, i) => (
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
          : vlogs.map((v: Vlog) => (
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
                  />
                </ButtonBase>
              </Card>
            ))}
      </div>
    </StyledContent>
  );
}
