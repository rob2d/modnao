import { ThemeProvider } from '@mui/material/styles';
import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter';
import type { AppProps } from 'next/app';
import '@/theming/globals.css';
import useUserTheme from '@/theming/useUserTheme';
import { wrapper } from '@/store';
import { ViewOptionsContextProvider } from '@/contexts/ViewOptionsContext';
import { SceneContextProvider } from '@/contexts/SceneContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Provider } from 'react-redux';

type ThisAppProps = AppProps;

const ThemedApp = ({ Component, ...props }: ThisAppProps) => {
  const theme = useUserTheme();

  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
};

export default function App({ Component, ...theseProps }: ThisAppProps) {
  const { store, props } = wrapper.useWrappedStore(theseProps);

  return (
    <AppCacheProvider {...theseProps}>
      <ViewOptionsContextProvider>
        <SceneContextProvider>
          <Provider store={store}>
            <ThemedApp {...props} Component={Component} />
          </Provider>
          <Analytics
            mode={
              process.env.NODE_ENV === 'production'
                ? 'production'
                : 'development'
            }
          />
          {process.env.NODE_ENV === 'production' ? <SpeedInsights /> : null}
        </SceneContextProvider>
      </ViewOptionsContextProvider>
    </AppCacheProvider>
  );
}
