import '@/theming/globals.css';
import { publicSans } from '@/theming/themes';
import useUserTheme from '@/theming/useUserTheme';
import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { ModNaoBrowserApiProvider } from '@/contexts/ModNaoBrowserApiContext';
import { SceneContextProvider } from '@/contexts/SceneContext';
import { SceneOptionsContextProvider } from '@/contexts/SceneOptionsContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

type ThisAppProps = AppProps;

const ThemedApp = ({ Component, ...props }: ThisAppProps) => {
  const theme = useUserTheme();

  return (
    <div className={publicSans.className}>
      <ThemeProvider theme={theme}>
        <Component {...props} />
      </ThemeProvider>
    </div>
  );
};

export default function App({ Component, ...theseProps }: ThisAppProps) {
  return (
    <AppCacheProvider {...theseProps}>
      <SceneOptionsContextProvider>
        <SceneContextProvider>
          <ModNaoBrowserApiProvider>
            <ThemedApp {...theseProps} Component={Component} />
          </ModNaoBrowserApiProvider>
          <Analytics
            mode={
              process.env.NODE_ENV === 'production'
                ? 'production'
                : 'development'
            }
          />
          {process.env.NODE_ENV === 'production' ? <SpeedInsights /> : null}
        </SceneContextProvider>
      </SceneOptionsContextProvider>
    </AppCacheProvider>
  );
}
