import { useEffect, useMemo, useRef, useState } from 'react';
import ImageBufferCanvas from '@/components/ImageBufferCanvas';
import globalBuffers from '@/utils/data/globalBuffers';
import type { UvClipPath } from '@/utils/textures';

const HOVERED_MODEL_UV_PULSE_MS = 2000;
const HOVERED_MODEL_UV_MAX_ALPHA = 0.275;

export interface ClipPathGroup {
  paths: UvClipPath[];
  color?: Readonly<[r: number, g: number, b: number]>;
}

interface GuiPanelTextureUvPreviewProps {
  imageBufferKey: string;
  uvHighlightBufferKey?: string;
  uvClipPathGroups: ClipPathGroup[];
  showUvHighlight: boolean;
  shouldPulseUvColorOverlay: boolean;
  width: number;
  height: number;
}

export default function GuiPanelTextureUvPreview({
  imageBufferKey,
  uvHighlightBufferKey,
  uvClipPathGroups,
  showUvHighlight,
  shouldPulseUvColorOverlay,
  width,
  height
}: GuiPanelTextureUvPreviewProps) {
  const rgbaBuffer = useMemo(
    () =>
      imageBufferKey ? globalBuffers.get(imageBufferKey) : new Uint8Array(0),
    [imageBufferKey]
  );
  const shouldUseSeparateUvHighlightBuffer =
    uvHighlightBufferKey && uvHighlightBufferKey !== imageBufferKey;
  const uvHighlightRgbaBuffer = useMemo(
    () =>
      shouldUseSeparateUvHighlightBuffer
        ? globalBuffers.get(uvHighlightBufferKey)
        : undefined,
    [shouldUseSeparateUvHighlightBuffer, uvHighlightBufferKey]
  );
  const [textureBitmaps, setTextureBitmaps] = useState<{
    source: ImageBitmap | null;
    highlight: ImageBitmap | null;
  }>({ source: null, highlight: null });
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;

    Promise.all(
      [rgbaBuffer, uvHighlightRgbaBuffer].map((buffer) => {
        if (
          !buffer?.length ||
          !width ||
          !height ||
          buffer.length !== width * height * 4
        ) {
          return null;
        }

        return createImageBitmap(
          new ImageData(new Uint8ClampedArray(buffer), width, height)
        );
      })
    ).then(([source, highlight]) => {
      if (active) {
        setTextureBitmaps({ source, highlight });
      }
    });

    return () => {
      active = false;
    };
  }, [rgbaBuffer, uvHighlightRgbaBuffer, width, height]);

  useEffect(() => {
    let animationFrameId = 0;

    const draw = () => {
      const canvas = imgCanvasRef.current;
      if (canvas && textureBitmaps.source) {
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, width, height);
          context.globalAlpha = showUvHighlight ? 0.25 : 1;
          context.filter = `saturate(${showUvHighlight ? '0' : '1'})`;
          context.drawImage(textureBitmaps.source, 0, 0);

          if (!showUvHighlight) {
            return;
          }

          const highlightTextureBitmap =
            textureBitmaps.highlight ?? textureBitmaps.source;
          const colorOverlayAlpha = shouldPulseUvColorOverlay
            ? HOVERED_MODEL_UV_MAX_ALPHA *
              ((Math.cos(
                (performance.now() / HOVERED_MODEL_UV_PULSE_MS) * Math.PI * 2
              ) +
                1) /
                2)
            : HOVERED_MODEL_UV_MAX_ALPHA;

          context.globalAlpha = 1;
          context.filter = 'saturate(1)';

          context.save();

          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((90 * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          uvClipPathGroups.forEach(({ paths, color }) => {
            paths.forEach((points) => {
              if (points.length === 0) {
                return;
              }

              context.save();
              context.beginPath();
              context.moveTo(points[0].x, points[0].y);

              for (let i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y);
              }

              context.closePath();
              context.clip();

              context.translate(canvas.width / 2, canvas.height / 2);
              context.rotate((-90 * Math.PI) / 180);
              context.translate(-canvas.width / 2, -canvas.height / 2);

              context.drawImage(highlightTextureBitmap, 0, 0);

              if (color) {
                const [red, green, blue] = color;
                context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${colorOverlayAlpha})`;
                context.fillRect(0, 0, canvas.width, canvas.height);
              }

              context.restore();
            });
          });
          context.restore();
        }
      }

      if (shouldPulseUvColorOverlay) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    textureBitmaps,
    uvClipPathGroups,
    showUvHighlight,
    shouldPulseUvColorOverlay,
    width,
    height
  ]);

  return (
    <ImageBufferCanvas
      rgbaBuffer={!rgbaBuffer?.length ? rgbaBuffer : undefined}
      ref={rgbaBuffer?.length ? imgCanvasRef : undefined}
      width={width}
      height={height}
      alt='Texture preview'
      className='img'
    />
  );
}
