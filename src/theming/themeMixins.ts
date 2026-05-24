import type { SystemStyleObject } from '@mui/system';

const themeMixins = {
  fileDragActiveAfter: {
    content: "''",
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--mui-palette-secondary-light)',
    border: '3px solid var(--mui-palette-secondary-main)',
    mixBlendMode: 'hard-light',
    opacity: 0.75,
    pointerEvents: 'none'
  } satisfies SystemStyleObject
};

export default themeMixins;
