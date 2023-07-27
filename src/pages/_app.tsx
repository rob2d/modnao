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
import { useContext } from 'react';

const clientSideEmotionCache = createEmotionCache();
interface ThisAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const defaultTheme = {};

const ThemedApp = ({ Component, ...props }: ThisAppProps) => {
  const viewOptions = useContext(ViewOptionsContext);
  const theme = useUserTheme(
    viewOptions.scenePalette || defaultTheme,
    viewOptions.themeKey
  );

  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
};

export default function App({ Component, ...theseProps }: ThisAppProps) {
  const { emotionCache = clientSideEmotionCache } = theseProps;
  const { store, props } = wrapper.useWrappedStore(theseProps);

  return (
    <CacheProvider value={emotionCache}>
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
        </SceneContextProvider>
      </ViewOptionsContextProvider>
    </CacheProvider>
  );
}
