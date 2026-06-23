import { useMemo } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { mdiImageOutline, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  IconButton,
  Typography
} from '@mui/material';
import type { XUpdate } from './devUpdates';

dayjs.extend(advancedFormat);

const xLogoPath =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z';

export default function XUpdateCard({ parts, publishedAt }: XUpdate) {
  const firstPostUrl = parts[0]?.url;
  const { hasImages, hasVideo } = useMemo(() => {
    let inferredHasImages = false;
    let inferredHasVideo = false;

    for (const part of parts) {
      inferredHasImages ||= Boolean(part.hasImages);
      inferredHasVideo ||= Boolean(part.hasVideo);

      if (inferredHasImages && inferredHasVideo) {
        break;
      }
    }

    return {
      hasImages: inferredHasImages,
      hasVideo: inferredHasVideo
    };
  }, [parts]);

  return (
    <Card elevation={2} sx={{ mr: 1 }} variant='outlined'>
      <CardContent
        sx={{
          position: 'relative',
          width: '100%',
          pr: 7
        }}
      >
        <Box>
          {parts.map((part, partIndex) => (
            <ButtonBase
              key={part.url}
              onClick={() => window.open(part.url, 'new')}
              sx={{
                alignItems: 'stretch',
                display: 'block',
                px: 0,
                pt: 0.75,
                pb: 0.75,
                position: 'relative',
                textAlign: 'left',
                width: '100%',
                '&::before':
                  partIndex === 0
                    ? undefined
                    : {
                        borderTop: '1px solid var(--mui-palette-divider)',
                        content: '""',
                        left: 0,
                        position: 'absolute',
                        right: 'calc(var(--mui-spacing) * 2)',
                        top: -1
                      }
              }}
            >
              <Typography component='div' variant='body2'>
                {part.textLines.map((line, lineIndex) => (
                  <Box
                    key={`${part.url}-${lineIndex}`}
                    component='span'
                    sx={{ display: 'block' }}
                  >
                    {line}
                  </Box>
                ))}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          component='div'
          sx={{ fontWeight: 700 }}
        >
          {dayjs(publishedAt).format('MMM Do, YYYY')}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            right: 18,
            bottom: 12,
            color: 'var(--mui-palette-text-secondary)',
            alignItems: 'center',
            display: 'inline-flex',
            gap: 0.75,
            opacity: 0.75,
            lineHeight: 0
          }}
        >
          {!hasImages ? null : (
            <Icon path={mdiImageOutline} size={0.65} title='Contains images' />
          )}
          {!hasVideo ? null : (
            <Icon
              path={mdiPlayCircleOutline}
              size={0.65}
              title='Contains video'
            />
          )}
          <IconButton
            aria-label='Open X thread'
            disabled={!firstPostUrl}
            onClick={() => {
              if (!firstPostUrl) {
                return;
              }

              window.open(firstPostUrl, 'new');
            }}
            size='small'
            sx={{ color: 'inherit', m: -0.5, ml: 0, p: 0.5 }}
          >
            <Icon path={xLogoPath} size={0.6} title='X' />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
