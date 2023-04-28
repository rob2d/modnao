import '@/styles/globals.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { Roboto } from 'next/font/google';
import { Provider } from 'react-redux';
import { wrapper } from '../store/store';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily
  }
});

export default function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Component {...props} />
      </ThemeProvider>
    </Provider>
  );
}
