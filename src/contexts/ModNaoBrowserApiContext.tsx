import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react';
import { useStore } from 'react-redux';
import createModNaoBrowserApi, {
  type ModNaoBrowserApiController
} from '@/modules/browser-api/createModNaoBrowserApi';
import type { AppStore } from '@/storeTypings';

const useAppStore = useStore.withTypes<AppStore>();

const ModNaoBrowserApiContext = createContext<ModNaoBrowserApiController>({
  mount: () => () => undefined,
  registerCamera: () => () => undefined,
  registerScene: () => () => undefined
});

export function ModNaoBrowserApiProvider({ children }: PropsWithChildren) {
  const store = useAppStore();
  const [controller] = useState(() => createModNaoBrowserApi(store));

  useEffect(() => controller.mount(), [controller]);

  return (
    <ModNaoBrowserApiContext.Provider value={controller}>
      {children}
    </ModNaoBrowserApiContext.Provider>
  );
}

export const useModNaoBrowserApiRegistration = () =>
  useContext(ModNaoBrowserApiContext);
