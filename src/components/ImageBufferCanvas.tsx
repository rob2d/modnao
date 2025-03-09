import { useEffect, useRef } from 'react';

type Props = {
  rgbaBuffer: Uint8Array;
  width: number;
  height: number;
  className: string;
  alt: string;
};

export default function CanvasImage({
  rgbaBuffer,
  width,
  height,
  className,
  alt
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (rgbaBuffer && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
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
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      role='img'
      aria-label={alt}
    />
  );
}
