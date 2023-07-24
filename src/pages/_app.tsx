import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import type { AppProps } from 'next/app';
import useUserTheme from '@/theming/useUserTheme';
import { wrapper } from '@/store';
import { ViewOptionsContextProvider } from '@/contexts/ViewOptionsContext';
import { SceneContextProvider } from '@/contexts/SceneContext';
import { Analytics } from '@vercel/analytics/react';
import { Provider } from 'react-redux';

const clientSideEmotionCache = createEmotionCache();
interface ThisAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, ...theseProps }: ThisAppProps) {
  const { emotionCache = clientSideEmotionCache } = theseProps;
  const theme = useUserTheme({});
  const { store, props } = wrapper.useWrappedStore(theseProps);

  return (
    <CacheProvider value={emotionCache}>
      <ViewOptionsContextProvider>
        <SceneContextProvider>
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <Component {...props} />
            </ThemeProvider>
          </Provider>
          <Analytics
            mode={
              process.env.NODE_ENV === 'production'
                ? 'production'
                : 'development'
            }
          />
        </SceneContextProvider>
      </ViewOptionsContextProvider>
    </CacheProvider>
  );
}
