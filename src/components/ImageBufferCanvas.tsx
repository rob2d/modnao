import React, { forwardRef, useEffect, useRef } from 'react';

type Props = {
  rgbaBuffer?: Uint8Array;
  width: number;
  height: number;
  className?: string;
  alt: string;
};

const ImageBufferCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ rgbaBuffer, width, height, className, alt }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas =
        (ref as React.RefObject<HTMLCanvasElement>)?.current ||
        canvasRef.current;
      if (rgbaBuffer && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          if (!rgbaBuffer?.length || width <= 0 || height <= 0) {
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
    }, [rgbaBuffer, width, height, ref]);

    return (
      <canvas
        ref={ref || canvasRef}
        width={width}
        height={height}
        className={className}
        role='img'
        aria-label={alt}
      />
    );
  }
);

ImageBufferCanvas.displayName = 'ImageBufferCanvas';

export default ImageBufferCanvas;
