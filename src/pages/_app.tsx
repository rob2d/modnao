import '@/styles/globals.css';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { wrapper } from '../store/store';
import theme from '@/theme';

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
