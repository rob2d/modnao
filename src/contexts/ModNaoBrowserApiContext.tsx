import createModNaoBrowserApi, {
  type ModNaoBrowserApiController
} from '@/modules/browser-api/createModNaoBrowserApi';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react';

const ModNaoBrowserApiContext = createContext<ModNaoBrowserApiController>({
  mount: () => () => undefined,
  registerCamera: () => () => undefined,
  registerScene: () => () => undefined
});

export function ModNaoBrowserApiProvider({ children }: PropsWithChildren) {
  const [controller] = useState(() => createModNaoBrowserApi());

  useEffect(() => controller.mount(), [controller]);

  return (
    <ModNaoBrowserApiContext.Provider value={controller}>
      {children}
    </ModNaoBrowserApiContext.Provider>
  );
}

export const useModNaoBrowserApiRegistration = () =>
  useContext(ModNaoBrowserApiContext);
