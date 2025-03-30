import { useEffect } from 'react';

const useClientEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      effect();
    }
  }, deps);
};

export default useClientEffect;
