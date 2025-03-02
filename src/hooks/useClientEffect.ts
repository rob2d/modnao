import { useEffect } from 'react';

const useClientEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useClientEffect;
