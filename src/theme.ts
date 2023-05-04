import { createTheme } from '@mui/material';
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily
  },
  palette: {
    primary: {
      main: '#FF00F2',
      contrastText: '#fff'
    },
    secondary: {
      main: '#00A5FF',
      contrastText: '#fff'
    }
  }
});

export default theme;
