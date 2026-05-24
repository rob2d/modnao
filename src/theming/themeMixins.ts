import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

const themeMixins = {
  fileDragActiveAfter: (theme: Theme) =>
    ({
      content: "''",
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor:
        theme.palette.secondary.light ?? theme.palette.secondary.main,
      border: `3px solid ${theme.palette.secondary.main}`,
      mixBlendMode: 'hard-light',
      opacity: 0.75,
      pointerEvents: 'none'
    }) satisfies SystemStyleObject<Theme>
};

export default themeMixins;
