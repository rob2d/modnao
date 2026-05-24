import { RefObject, useEffect, useState } from 'react';

interface ResizeObserverSize {
  width: number;
  height: number;
}

const useResizeObserverSize = <TElement extends Element>(
  elementRef: RefObject<TElement | null>,
  initialSize: ResizeObserverSize
) => {
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [elementRef, initialSize.height, initialSize.width]);

  return size;
};

export default useResizeObserverSize;
