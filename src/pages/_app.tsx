import '@/theming/globals.css';
import { ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { wrapper } from '../store/store';
import useModedTheme from '@/theming/useModedTheme';
import { ViewOptionsContextProvider } from '@/contexts/ViewOptionsContext';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, ...rest }: AppProps) {
  const theme = useModedTheme();
  const { store, props } = wrapper.useWrappedStore(rest);

  return (
    <ViewOptionsContextProvider>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Component {...props} />
        </ThemeProvider>
      </Provider>
      <Analytics
        mode={
          process.env.NODE_ENV === 'production' ? 'production' : 'development'
        }
      />
      ;
    </ViewOptionsContextProvider>
  );
}
