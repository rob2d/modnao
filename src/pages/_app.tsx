import '@/theming/globals.css';
import { ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { wrapper } from '../store/store';
import useModedTheme from '@/theming/useModedTheme';

export default function App({ Component, ...rest }: AppProps) {
  const theme = useModedTheme();
  const { store, props } = wrapper.useWrappedStore(rest);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Component {...props} />
      </ThemeProvider>
    </Provider>
  );
}
