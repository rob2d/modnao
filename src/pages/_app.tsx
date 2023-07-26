import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import type { AppProps } from 'next/app';
import useUserTheme from '@/theming/useUserTheme';
import { wrapper } from '@/store';
import ViewOptionsContext, {
  ViewOptionsContextProvider
} from '@/contexts/ViewOptionsContext';
import { SceneContextProvider } from '@/contexts/SceneContext';
import { Analytics } from '@vercel/analytics/react';
import { Provider } from 'react-redux';
import { useContext, useEffect } from 'react';

const clientSideEmotionCache = createEmotionCache();
interface ThisAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const defaultTheme = {};

export default function App({ Component, ...theseProps }: ThisAppProps) {
  const { emotionCache = clientSideEmotionCache } = theseProps;
  const viewOptions = useContext(ViewOptionsContext);
  const theme = useUserTheme(viewOptions.scenePalette || defaultTheme);
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
