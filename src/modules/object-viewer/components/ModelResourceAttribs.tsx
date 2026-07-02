import clsx from 'clsx';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import gameNameMap from '@/constants/gameNameMap';
import { selectModelIndex, selectResourceAttribs } from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import { Box, ButtonBase, Divider, Paper, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useContext } from 'react';

export default function ModelResourceAttribs() {
  const viewContext = useContext(SceneOptionsContext);
  const resourceAttribs = useAppSelector(selectResourceAttribs);
  const modelIndex = useAppSelector(selectModelIndex);
  if (!resourceAttribs) {
    return null;
  }

  const modelHints =
    resourceAttribs.polygonMapped && resourceAttribs.modelHints?.[modelIndex];

  const isShown =
    viewContext.showBrowsedObjectHints && !viewContext.enableCinematicMode;

  return (
    <Paper
      className={clsx(!isShown && 'hidden')}
      sx={{
        position: 'relative',
        pointerEvents: !isShown ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        mx: 3,
        my: 2,
        p: 1,
        pr: 5,
        flexGrow: 0,
        width: 'fit-content',
        maxWidth: 'calc(100vw - (var(--mui-spacing) * 6))',
        animation: 'fadeIn 500ms ease',
        animationFillMode: 'both',
        '&.hidden': {
          animation: 'fadeOut 500ms ease',
          animationFillMode: 'both'
        },
        '&:hover .MuiButtonBase-root': {
          opacity: 1
        },
        '@keyframes fadeIn': {
          from: { opacity: 0, left: '-440px' },
          to: { opacity: 1, left: '0' }
        },
        '@keyframes fadeOut': {
          from: { opacity: 1, left: '0' },
          to: { opacity: 0, left: '-440px' }
        }
      }}
      elevation={3}
    >
      <Box sx={{ display: 'flex', minWidth: 0, maxWidth: '100%' }}>
        <Typography
          variant='h5'
          color='textPrimary'
          noWrap
          sx={{ display: 'flex', lineHeight: 1, minWidth: 0 }}
        >
          {resourceAttribs.name} <Divider orientation='horizontal' flexItem />
        </Typography>
        <Divider flexItem orientation='vertical' sx={{ mx: 1 }} />
        <Typography
          variant='h5'
          color='textSecondary'
          noWrap
          sx={{ display: 'flex', lineHeight: 1, minWidth: 0 }}
        >
          {gameNameMap[resourceAttribs.game]}
        </Typography>
      </Box>
      {!modelHints ? null : (
        <>
          <Typography variant='h6' sx={{ mt: 0.5, width: 0, minWidth: '100%' }}>
            {modelHints.name}
          </Typography>

          {!modelHints.description ? null : (
            <Typography
              variant='body1'
              color='textSecondary'
              sx={{ width: 0, minWidth: '100%' }}
            >
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
        onClick={() => viewContext.setShowBrowsedObjectHints(false)}
      >
        <ChevronLeftIcon />
      </ButtonBase>
    </Paper>
  );
}
