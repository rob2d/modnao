import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Typography
} from '@mui/material';
import type { AsyncState } from '@/types';

export interface DevUpdateCardProps {
  imageAlt?: string;
  imageUrl?: string;
  loadingState?: AsyncState;
  onClick?: () => void;
  showImage?: boolean;
  subtitle?: string;
  title?: string;
}

export default function DevUpdateCard({
  imageAlt,
  imageUrl,
  loadingState,
  onClick,
  showImage,
  subtitle,
  title
}: DevUpdateCardProps) {
  const shouldShowImage = showImage ?? Boolean(imageUrl);
  const isLoading = loadingState === 'pending';

  const content = (
    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexBasis: { xs: '100%', md: shouldShowImage ? '85%' : '100%' },
        textAlign: 'left'
      }}
    >
      <Typography component='div' variant='subtitle1'>
        {!isLoading ? title : <Skeleton height={60} />}
      </Typography>
      <Typography
        variant={!isLoading ? 'body2' : 'subtitle1'}
        color='text.secondary'
        component='div'
      >
        {!isLoading ? subtitle : <Skeleton />}
      </Typography>
    </CardContent>
  );

  const media = !shouldShowImage ? null : isLoading ? (
    <Skeleton variant='rectangular' width={100} height={120} />
  ) : !imageUrl ? null : (
    <CardMedia
      component='img'
      image={imageUrl}
      alt={imageAlt}
      sx={{
        display: { xs: 'none', md: 'block' },
        width: 'max(15%, 104px)',
        height: '100%'
      }}
    />
  );

  return (
    <Card
      elevation={2}
      sx={{ ml: 0, mr: 1, display: 'flex' }}
      variant='outlined'
    >
      {isLoading ? (
        <Box sx={{ width: '100%', display: 'flex' }}>
          {content}
          {media}
        </Box>
      ) : (
        <ButtonBase
          onClick={onClick}
          sx={{ width: '100%', alignItems: 'stretch', textAlign: 'left' }}
        >
          {content}
          {media}
        </ButtonBase>
      )}
    </Card>
  );
}
