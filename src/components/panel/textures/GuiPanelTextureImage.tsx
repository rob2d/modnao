import { objectUrlToBuffer } from '@/utils/data';
import { useEffect, useRef } from 'react';

type Props = { pixelDataUrl: string; width: number; height: number };
export default function GuiPanelTextureImage({
  pixelDataUrl,
  width,
  height
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      const pixels = new Uint8Array(await objectUrlToBuffer(pixelDataUrl));
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const context = canvasRef.current!.getContext(
        '2d'
      ) as CanvasRenderingContext2D;
      context.canvas.width = width;
      context.canvas.height = height;

      const imageData = new ImageData(width, height);
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);
    })();
  }, [pixelDataUrl]);
  return <canvas ref={canvasRef} />;
}
