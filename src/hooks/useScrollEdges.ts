import { CSSProperties, RefObject, useEffect, useRef, useState } from 'react';

interface ScrollEdgesState {
  hasScrollAbove: boolean;
  hasScrollBelow: boolean;
  scrollEdgeTopOpacity: number;
  scrollEdgeBottomOpacity: number;
}

interface ScrollEdgeStyle extends CSSProperties {
  '--dialog-scroll-edge-top-opacity': number;
  '--dialog-scroll-edge-bottom-opacity': number;
}

interface UseScrollEdgesResult<TElement extends HTMLElement> {
  containerRef: RefObject<TElement | null>;
  hasScrollAbove: boolean;
  hasScrollBelow: boolean;
  scrollEdgeStyle: ScrollEdgeStyle;
}

const scrollBoundaryTolerance = 1;
const scrollEdgeOpacityRampDistance = 48;

const getScrollEdgeOpacity = (distanceFromEdge: number) => {
  const opacity = Math.min(
    Math.max(distanceFromEdge / scrollEdgeOpacityRampDistance, 0),
    1
  );

  return Math.round(opacity * 100) / 100;
};

const areScrollEdgesStatesEqual = (
  previousState: ScrollEdgesState,
  nextState: ScrollEdgesState
) =>
  previousState.hasScrollAbove === nextState.hasScrollAbove &&
  previousState.hasScrollBelow === nextState.hasScrollBelow &&
  previousState.scrollEdgeTopOpacity === nextState.scrollEdgeTopOpacity &&
  previousState.scrollEdgeBottomOpacity === nextState.scrollEdgeBottomOpacity;

const getScrollEdgesState = (element: HTMLElement): ScrollEdgesState => {
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  const hasScrollableContent = maxScrollTop > scrollBoundaryTolerance;
  const distanceFromBottom = maxScrollTop - element.scrollTop;

  return {
    hasScrollAbove:
      hasScrollableContent && element.scrollTop > scrollBoundaryTolerance,
    hasScrollBelow:
      hasScrollableContent &&
      element.scrollTop < maxScrollTop - scrollBoundaryTolerance,
    scrollEdgeTopOpacity: !hasScrollableContent
      ? 0
      : getScrollEdgeOpacity(element.scrollTop),
    scrollEdgeBottomOpacity: !hasScrollableContent
      ? 0
      : getScrollEdgeOpacity(distanceFromBottom)
  };
};

export default function useScrollEdges<
  TElement extends HTMLElement
>(): UseScrollEdgesResult<TElement> {
  const containerRef = useRef<TElement | null>(null);
  const [scrollEdgesState, setScrollEdgesState] = useState<ScrollEdgesState>({
    hasScrollAbove: false,
    hasScrollBelow: false,
    scrollEdgeTopOpacity: 0,
    scrollEdgeBottomOpacity: 0
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const nextState = getScrollEdgesState(element);

    setScrollEdgesState((previousState) =>
      areScrollEdgesStatesEqual(previousState, nextState)
        ? previousState
        : nextState
    );
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateScrollEdges = () => {
      const nextState = getScrollEdgesState(element);

      setScrollEdgesState((previousState) =>
        areScrollEdgesStatesEqual(previousState, nextState)
          ? previousState
          : nextState
      );
    };

    updateScrollEdges();

    element.addEventListener('scroll', updateScrollEdges, { passive: true });
    window.addEventListener('resize', updateScrollEdges);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => updateScrollEdges());

    resizeObserver?.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollEdges);
      window.removeEventListener('resize', updateScrollEdges);
      resizeObserver?.disconnect();
    };
  }, []);

  return {
    containerRef,
    hasScrollAbove: scrollEdgesState.hasScrollAbove,
    hasScrollBelow: scrollEdgesState.hasScrollBelow,
    scrollEdgeStyle: {
      '--dialog-scroll-edge-top-opacity': scrollEdgesState.scrollEdgeTopOpacity,
      '--dialog-scroll-edge-bottom-opacity':
        scrollEdgesState.scrollEdgeBottomOpacity
    }
  };
}
