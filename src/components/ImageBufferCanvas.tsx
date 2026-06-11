import React, { forwardRef, useEffect, useRef } from 'react';

import { useResizeObserverSize } from '@/hooks';

type Props = {
  rgbaBuffer?: Uint8Array;
  width: number;
  height: number;
  className?: string;
  alt: string;
};

const pixelatedStyle = { imageRendering: 'pixelated' } as const;

const ImageBufferCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ rgbaBuffer, width, height, className, alt }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderedSize = useResizeObserverSize(canvasRef, {
      width,
      height
    });
    const isPixelated =
      renderedSize.width >= width && renderedSize.height >= height;

    const setCanvasRef = (canvas: HTMLCanvasElement | null) => {
      canvasRef.current = canvas;

      if (typeof ref === 'function') {
        ref(canvas);
        return;
      }

      if (ref) {
        ref.current = canvas;
      }
    };

    useEffect(() => {
      const canvas = canvasRef.current;

      if (rgbaBuffer && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          if (
            !rgbaBuffer?.length ||
            width <= 0 ||
            height <= 0 ||
            rgbaBuffer.length !== width * height * 4
          ) {
            context.clearRect(0, 0, width, height);
            return;
          }
          const imageData = new ImageData(
            new Uint8ClampedArray(rgbaBuffer),
            width,
            height
          );
          context.putImageData(imageData, 0, 0);
        }
      }
    }, [rgbaBuffer, width, height]);

    return (
      <canvas
        ref={setCanvasRef}
        width={width}
        height={height}
        className={className}
        role='img'
        aria-label={alt}
        style={isPixelated ? pixelatedStyle : undefined}
      />
    );
  }
);

ImageBufferCanvas.displayName = 'ImageBufferCanvas';

export default ImageBufferCanvas;
