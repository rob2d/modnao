import {
  selectModelIndex,
  selectObjectKey,
  selectResourceAttribs
} from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import { Box, Divider, Paper, Typography } from '@mui/material';

const gameNameMap: Record<string, string> = {
  MVC2: 'Marvel vs Capcom 2',
  CVS1: 'Capcom vs SNK 1',
  CVS2: 'Capcom vs SNK 2',
  VS2: 'MVC2 or CVS2',
  SFA3: 'Street Fighter Alpha 3'
} as const;

export default function ModelResourceAttribs() {
  const resourceAttribs = useAppSelector(selectResourceAttribs);
  const modelIndex = useAppSelector(selectModelIndex);
  if (!resourceAttribs) {
    return null;
  }

  const modelHints =
    resourceAttribs.polygonMapped && resourceAttribs.modelHints?.[modelIndex];

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mx: 3,
        my: 2,
        p: 1,
        flexGrow: 0,
        maxWidth: 440
      }}
      elevation={3}
    >
      <Box sx={{ display: 'flex' }}>
        <Typography
          variant='h5'
          color='textPrimary'
          sx={{ display: 'flex', lineHeight: 1 }}
        >
          {resourceAttribs.name} <Divider orientation='horizontal' flexItem />
        </Typography>
        <Divider flexItem orientation='vertical' sx={{ mx: 1 }} />
        <Typography
          variant='h5'
          color='textSecondary'
          sx={{ display: 'flex', lineHeight: 1 }}
        >
          {gameNameMap[resourceAttribs.game]}
        </Typography>
      </Box>
      {!modelHints ? null : (
        <>
          <Typography variant='h6' sx={{ mt: 0.5 }}>
            {modelHints.name}
          </Typography>

          {!modelHints.description ? null : (
            <Typography variant='body1' color='textSecondary'>
              {modelHints.description}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
