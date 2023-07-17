import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  styled
} from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';
dayjs.extend(advancedFormat);

const StyledContent = styled('div')(
  () => `
& {
}

& .vlog-entry {
  width: 100%;
  height: auto;
}

& .vlog-entry-iframe {
  width: 100%;
  height: auto;
}

& > div:nth-child(2) {
  overflow-y: auto;
}`
);

const origin =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

let hasFetched = false;
const useVlogApi = () => {
  const [vlogs, setVlogs] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await (await fetch(`${origin}/api/vlogs`)).json();
      setVlogs(response);
      console.log('respoinse ->', response);
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
      <AppInfoSectionHeader>Development Updates</AppInfoSectionHeader>
      <div>
        {vlogs.map((v) => (
          <Card sx={{ display: 'flex', marginBottom: '16px' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexBasis: '85%'
              }}
            >
              <CardContent>
                <Typography component='div' variant='h6'>
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
            </Box>
            <CardMedia
              component='img'
              image={`${v.thumbnailUrl}`}
              alt={`Watch ${v.vlogNumber} now`}
              style={{ width: '15%', height: 'auto' }}
            />
          </Card>
        ))}
      </div>
    </StyledContent>
  );
}
