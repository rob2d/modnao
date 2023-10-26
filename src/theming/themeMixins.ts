import { Theme } from '@mui/material/styles';

const themeMixins = {
  fileDragActiveAfter: (theme: Theme) => `
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: ${theme.palette.secondary.light};
    border: 3px solid ${theme.palette.secondary.main};
    mix-blend-mode: hard-light;
    opacity: 0.75;
    pointer-events: none;
  `
};

export default themeMixins;
