import gameNameMap from '@/constants/gameNameMap';
import { selectModelIndex, selectResourceAttribs } from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import { Box, ButtonBase, Divider, Paper, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

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
        position: 'relative',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        mx: 3,
        my: 2,
        p: 1,
        pr: 3,
        flexGrow: 0,
        maxWidth: 444,
        '&:hover .MuiButtonBase-root': {
          opacity: 1
        }
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
      <ButtonBase
        sx={{
          position: 'absolute',
          color: 'var(--mui-palette-text-deemphasized)',
          top: 0,
          right: 0,
          mr: 1,
          mt: 0.75,
          opacity: 0,
          zIndex: 1,
          transition: (theme) =>
            `opacity ${theme.transitions.duration.standard}ms ease`
        }}
      >
        <ChevronLeftIcon />
      </ButtonBase>
    </Paper>
  );
}
