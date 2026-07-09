import type { PointerEvent } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { Signal } from '@preact-signals/safe-react';
import { effect as signalEffect } from '@preact-signals/safe-react';
import { type ColorResult, SketchPicker } from 'react-color';
import { Box, Popover } from '@mui/material';

interface GradientMeshPoint {
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
}

interface ProjectedGradientMeshPoint {
  screenX: number;
  screenY: number;
  depth: number;
}

interface GradientMeshSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeWidth: number;
  opacity: number;
}

interface GradientPreviewGeometry {
  meshSegments: GradientMeshSegment[];
  startHandleLeft: string;
  startHandleTop: string;
  startHandleSize: string;
  startHandleOutlineOpacity: string;
  endHandleLeft: string;
  endHandleTop: string;
  endHandleSize: string;
  endHandleOutlineOpacity: string;
  startCenterX: number;
  startCenterY: number;
  endCenterX: number;
  endCenterY: number;
  barPoints: string;
}

interface GradientSelectionPreviewProps {
  $gradientAngle: Signal<number>;
  $gradientTilt: Signal<number>;
  popoverAnchorEl: HTMLDivElement | null;
  onChangeAngles: (angle: number, tilt: number) => void;
}

type GradientColorHandle = 'start' | 'end';

interface PendingGradientHandleDrag {
  handle: GradientColorHandle;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startedAt: number;
  hasDragged: boolean;
}

interface GradientColorHandleConfig {
  handle: GradientColorHandle;
  ariaLabel: string;
  centerXProperty: string;
  centerYProperty: string;
  sizeProperty: string;
  outlineOpacityProperty: string;
  fallbackCenterX: number;
  fallbackCenterY: number;
  fallbackSize: string;
  fallbackOutlineOpacity: string;
}

interface GradientAxisLabelConfig {
  label: string;
  position: {
    left?: string;
    right?: string;
    top: string;
  };
}

const GRADIENT_MOCK_START_COLOR = '#ff4f7a';
const GRADIENT_MOCK_END_COLOR = '#32d7ff';
export const DEFAULT_GRADIENT_ANGLE = 90;
export const DEFAULT_GRADIENT_TILT = 0;
export const GRADIENT_MAX_ANGLE = 180;
const GRADIENT_HANDLE_SIZE = 14;
const GRADIENT_HANDLE_HIT_AREA_SIZE = 28;
const GRADIENT_BACK_HANDLE_SCALE = 3;
const GRADIENT_FRONT_HANDLE_SCALE = 8;
const GRADIENT_BAR_BASE_HEIGHT = 6;
const GRADIENT_BAR_MAX_HEIGHT = 12;
const GRADIENT_BAR_DEPTH_SCALE = 6;
const GRADIENT_MESH_VIEWBOX_CENTER = 72;
const GRADIENT_MESH_RADIUS = 49;
const GRADIENT_AXIS_LABEL_SIZE = 18;
const GRADIENT_AXIS_LABEL_RADIUS = 62;
const GRADIENT_AXIS_LABEL_DIAGONAL_OFFSET = Math.round(
  GRADIENT_AXIS_LABEL_RADIUS / Math.SQRT2
);
const GRADIENT_MESH_PERSPECTIVE = 0.18;
const GRADIENT_MESH_LATITUDES = [-60, -30, 0, 30, 60];
const GRADIENT_MESH_LONGITUDES = [0, 30, 60, 90, 120, 150];
const GRADIENT_MESH_SAMPLE_DEGREES = 10;
const GRADIENT_BAR_FILL_ID = 'gradient-direction-bar-fill';
const GRADIENT_BAR_OUTLINE_ID = 'gradient-direction-bar-outline';
const GRADIENT_HANDLE_DRAG_DISTANCE = 5;
const GRADIENT_HANDLE_DRAG_DELAY = 140;
const GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN = {
  vertical: 'center',
  horizontal: 'left'
} as const;
const GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN = {
  vertical: 'center',
  horizontal: 'right'
} as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const projectGradientMeshPoint = (
  point: GradientMeshPoint,
  angleRadians: number,
  tiltRadians: number
): ProjectedGradientMeshPoint => {
  const yawRadians = angleRadians - Math.PI / 2;
  const yawCosine = Math.cos(yawRadians);
  const yawSine = Math.sin(yawRadians);
  const pitchCosine = Math.cos(tiltRadians);
  const pitchSine = Math.sin(tiltRadians);
  const yawedX = point.coordinateX * yawCosine + point.coordinateZ * yawSine;
  const yawedZ = -point.coordinateX * yawSine + point.coordinateZ * yawCosine;
  const projectedY = point.coordinateY * pitchCosine - yawedZ * pitchSine;
  const projectedZ = point.coordinateY * pitchSine + yawedZ * pitchCosine;
  const perspectiveScale = 1 / (1 - projectedZ * GRADIENT_MESH_PERSPECTIVE);

  return {
    screenX:
      GRADIENT_MESH_VIEWBOX_CENTER +
      yawedX * GRADIENT_MESH_RADIUS * perspectiveScale,
    screenY:
      GRADIENT_MESH_VIEWBOX_CENTER -
      projectedY * GRADIENT_MESH_RADIUS * perspectiveScale,
    depth: projectedZ
  };
};

const createGradientMeshSegment = (
  id: string,
  startPoint: ProjectedGradientMeshPoint,
  endPoint: ProjectedGradientMeshPoint
): GradientMeshSegment => {
  const depth = (startPoint.depth + endPoint.depth) / 2;
  const normalizedDepth = (depth + 1) / 2;

  return {
    id,
    startX: startPoint.screenX,
    startY: startPoint.screenY,
    endX: endPoint.screenX,
    endY: endPoint.screenY,
    strokeWidth: 0.45 + normalizedDepth * 0.85,
    opacity: 0.22 + normalizedDepth * 0.48
  };
};

const createGradientMeshSegments = (
  angleRadians: number,
  tiltRadians: number
): GradientMeshSegment[] => {
  const segments: GradientMeshSegment[] = [];
  const addSegment = (
    id: string,
    startPoint: GradientMeshPoint,
    endPoint: GradientMeshPoint
  ) => {
    segments.push(
      createGradientMeshSegment(
        id,
        projectGradientMeshPoint(startPoint, angleRadians, tiltRadians),
        projectGradientMeshPoint(endPoint, angleRadians, tiltRadians)
      )
    );
  };

  GRADIENT_MESH_LATITUDES.forEach((latitude) => {
    const latitudeRadians = toRadians(latitude);
    const latitudeRadius = Math.cos(latitudeRadians);
    const latitudeY = Math.sin(latitudeRadians);

    for (
      let longitude = 0;
      longitude < 360;
      longitude += GRADIENT_MESH_SAMPLE_DEGREES
    ) {
      const nextLongitude = longitude + GRADIENT_MESH_SAMPLE_DEGREES;
      const longitudeRadians = toRadians(longitude);
      const nextLongitudeRadians = toRadians(nextLongitude);

      addSegment(
        `lat-${latitude}-${longitude}`,
        {
          coordinateX: latitudeRadius * Math.cos(longitudeRadians),
          coordinateY: latitudeY,
          coordinateZ: latitudeRadius * Math.sin(longitudeRadians)
        },
        {
          coordinateX: latitudeRadius * Math.cos(nextLongitudeRadians),
          coordinateY: latitudeY,
          coordinateZ: latitudeRadius * Math.sin(nextLongitudeRadians)
        }
      );
    }
  });

  GRADIENT_MESH_LONGITUDES.forEach((longitude) => {
    const longitudeRadians = toRadians(longitude);

    for (
      let latitude = -80;
      latitude < 80;
      latitude += GRADIENT_MESH_SAMPLE_DEGREES
    ) {
      const latitudeRadians = toRadians(latitude);
      const nextLatitudeRadians = toRadians(
        latitude + GRADIENT_MESH_SAMPLE_DEGREES
      );
      const latitudeRadius = Math.cos(latitudeRadians);
      const nextLatitudeRadius = Math.cos(nextLatitudeRadians);

      addSegment(
        `lon-${longitude}-${latitude}`,
        {
          coordinateX: latitudeRadius * Math.cos(longitudeRadians),
          coordinateY: Math.sin(latitudeRadians),
          coordinateZ: latitudeRadius * Math.sin(longitudeRadians)
        },
        {
          coordinateX: nextLatitudeRadius * Math.cos(longitudeRadians),
          coordinateY: Math.sin(nextLatitudeRadians),
          coordinateZ: nextLatitudeRadius * Math.sin(longitudeRadians)
        }
      );
    }
  });

  return segments;
};

const createGradientPreviewGeometry = (
  gradientAngle: number,
  gradientTilt: number
): GradientPreviewGeometry => {
  const gradientAngleRadians = (gradientAngle * Math.PI) / 180;
  const gradientTiltRadians = (gradientTilt * Math.PI) / 180;
  const gradientMeshSegments = createGradientMeshSegments(
    gradientAngleRadians,
    gradientTiltRadians
  );
  const gradientProjectionScale = Math.max(0.18, Math.cos(gradientTiltRadians));
  const gradientProjectionRadius = 52 * gradientProjectionScale;
  const gradientDirectionX =
    Math.cos(gradientAngleRadians) * gradientProjectionRadius;
  const gradientDirectionY =
    Math.sin(gradientAngleRadians) * gradientProjectionRadius;
  const gradientDepthScale = Math.sin(gradientTiltRadians);
  const gradientStartHandleSize =
    gradientDepthScale > 0
      ? GRADIENT_HANDLE_SIZE - gradientDepthScale * GRADIENT_BACK_HANDLE_SCALE
      : GRADIENT_HANDLE_SIZE - gradientDepthScale * GRADIENT_FRONT_HANDLE_SCALE;
  const gradientEndHandleSize =
    gradientDepthScale > 0
      ? GRADIENT_HANDLE_SIZE + gradientDepthScale * GRADIENT_FRONT_HANDLE_SCALE
      : GRADIENT_HANDLE_SIZE + gradientDepthScale * GRADIENT_BACK_HANDLE_SCALE;
  const gradientStartHandleOutlineOpacity =
    gradientDepthScale > 0 ? 0.72 - gradientDepthScale * 0.46 : 0.72;
  const gradientEndHandleOutlineOpacity =
    gradientDepthScale > 0 ? 0.72 : 0.72 + gradientDepthScale * 0.46;
  const gradientStartBarHeight =
    GRADIENT_BAR_BASE_HEIGHT - gradientDepthScale * GRADIENT_BAR_DEPTH_SCALE;
  const gradientEndBarHeight =
    GRADIENT_BAR_BASE_HEIGHT + gradientDepthScale * GRADIENT_BAR_DEPTH_SCALE;
  const gradientStartBarInset =
    (GRADIENT_BAR_MAX_HEIGHT - gradientStartBarHeight) / 2;
  const gradientEndBarInset =
    (GRADIENT_BAR_MAX_HEIGHT - gradientEndBarHeight) / 2;
  const gradientStartCenterX =
    GRADIENT_MESH_VIEWBOX_CENTER - gradientDirectionX;
  const gradientStartCenterY =
    GRADIENT_MESH_VIEWBOX_CENTER + gradientDirectionY;
  const gradientEndCenterX = GRADIENT_MESH_VIEWBOX_CENTER + gradientDirectionX;
  const gradientEndCenterY = GRADIENT_MESH_VIEWBOX_CENTER - gradientDirectionY;
  const gradientBarDeltaX = gradientEndCenterX - gradientStartCenterX;
  const gradientBarDeltaY = gradientEndCenterY - gradientStartCenterY;
  const gradientBarLength = Math.hypot(gradientBarDeltaX, gradientBarDeltaY);
  const gradientBarPerpendicularX = -gradientBarDeltaY / gradientBarLength;
  const gradientBarPerpendicularY = gradientBarDeltaX / gradientBarLength;
  const gradientStartBarHalfHeight =
    GRADIENT_BAR_MAX_HEIGHT / 2 - gradientStartBarInset;
  const gradientEndBarHalfHeight =
    GRADIENT_BAR_MAX_HEIGHT / 2 - gradientEndBarInset;

  return {
    meshSegments: gradientMeshSegments,
    startHandleLeft: `${gradientStartCenterX - gradientStartHandleSize / 2}px`,
    startHandleTop: `${gradientStartCenterY - gradientStartHandleSize / 2}px`,
    startHandleSize: `${gradientStartHandleSize}px`,
    startHandleOutlineOpacity: `${gradientStartHandleOutlineOpacity}`,
    endHandleLeft: `${gradientEndCenterX - gradientEndHandleSize / 2}px`,
    endHandleTop: `${gradientEndCenterY - gradientEndHandleSize / 2}px`,
    endHandleSize: `${gradientEndHandleSize}px`,
    endHandleOutlineOpacity: `${gradientEndHandleOutlineOpacity}`,
    startCenterX: gradientStartCenterX,
    startCenterY: gradientStartCenterY,
    endCenterX: gradientEndCenterX,
    endCenterY: gradientEndCenterY,
    barPoints: [
      `${gradientStartCenterX + gradientBarPerpendicularX * gradientStartBarHalfHeight},${gradientStartCenterY + gradientBarPerpendicularY * gradientStartBarHalfHeight}`,
      `${gradientEndCenterX + gradientBarPerpendicularX * gradientEndBarHalfHeight},${gradientEndCenterY + gradientBarPerpendicularY * gradientEndBarHalfHeight}`,
      `${gradientEndCenterX - gradientBarPerpendicularX * gradientEndBarHalfHeight},${gradientEndCenterY - gradientBarPerpendicularY * gradientEndBarHalfHeight}`,
      `${gradientStartCenterX - gradientBarPerpendicularX * gradientStartBarHalfHeight},${gradientStartCenterY - gradientBarPerpendicularY * gradientStartBarHalfHeight}`
    ].join(' ')
  };
};

const DEFAULT_GRADIENT_PREVIEW_GEOMETRY = createGradientPreviewGeometry(
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_TILT
);

const GRADIENT_COLOR_HANDLE_CONFIGS: readonly GradientColorHandleConfig[] = [
  {
    handle: 'start',
    ariaLabel: 'Choose gradient start color',
    centerXProperty: '--gradient-start-handle-center-x',
    centerYProperty: '--gradient-start-handle-center-y',
    sizeProperty: '--gradient-start-handle-size',
    outlineOpacityProperty: '--gradient-start-handle-outline-opacity',
    fallbackCenterX: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterX,
    fallbackCenterY: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterY,
    fallbackSize: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startHandleSize,
    fallbackOutlineOpacity:
      DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startHandleOutlineOpacity
  },
  {
    handle: 'end',
    ariaLabel: 'Choose gradient end color',
    centerXProperty: '--gradient-end-handle-center-x',
    centerYProperty: '--gradient-end-handle-center-y',
    sizeProperty: '--gradient-end-handle-size',
    outlineOpacityProperty: '--gradient-end-handle-outline-opacity',
    fallbackCenterX: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterX,
    fallbackCenterY: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterY,
    fallbackSize: DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endHandleSize,
    fallbackOutlineOpacity:
      DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endHandleOutlineOpacity
  }
];

const GRADIENT_AXIS_LABEL_CONFIGS: readonly GradientAxisLabelConfig[] = [
  {
    label: 'X',
    position: {
      right: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_RADIUS - GRADIENT_AXIS_LABEL_SIZE / 2}px`,
      top: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_SIZE / 2}px`
    }
  },
  {
    label: 'Y',
    position: {
      left: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_SIZE / 2}px`,
      top: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_RADIUS - GRADIENT_AXIS_LABEL_SIZE / 2}px`
    }
  },
  {
    label: 'Z',
    position: {
      right: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_DIAGONAL_OFFSET - GRADIENT_AXIS_LABEL_SIZE / 2}px`,
      top: `${GRADIENT_MESH_VIEWBOX_CENTER - GRADIENT_AXIS_LABEL_DIAGONAL_OFFSET - GRADIENT_AXIS_LABEL_SIZE / 2}px`
    }
  }
];

export default memo(function GradientSelectionPreview({
  $gradientAngle,
  $gradientTilt,
  popoverAnchorEl,
  onChangeAngles
}: GradientSelectionPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const meshLineRefs = useRef<Array<SVGLineElement | null>>([]);
  const previewFillGradientRef = useRef<SVGLinearGradientElement>(null);
  const barFillGradientRef = useRef<SVGLinearGradientElement>(null);
  const barOutlineGradientRef = useRef<SVGLinearGradientElement>(null);
  const barPolygonRef = useRef<SVGPolygonElement>(null);
  const pendingGradientHandleDragRef = useRef<PendingGradientHandleDrag | null>(
    null
  );
  const [gradientStartColor, setGradientStartColor] = useState(
    GRADIENT_MOCK_START_COLOR
  );
  const [gradientEndColor, setGradientEndColor] = useState(
    GRADIENT_MOCK_END_COLOR
  );
  const [isGradientColorPopoverOpen, setIsGradientColorPopoverOpen] =
    useState(false);
  const [activeGradientColorHandle, setActiveGradientColorHandle] =
    useState<GradientColorHandle | null>(null);
  const gradientColorByHandle = {
    start: gradientStartColor,
    end: gradientEndColor
  } satisfies Record<GradientColorHandle, string>;
  const activeGradientColor =
    activeGradientColorHandle === 'start'
      ? gradientStartColor
      : gradientEndColor;
  const onUpdatePreviewFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const previewElement = previewRef.current;

      if (!previewElement) {
        return;
      }

      const bounds = previewElement.getBoundingClientRect();
      const nextAngle = Math.round(
        ((clientX - bounds.left) / bounds.width) * GRADIENT_MAX_ANGLE
      );
      const nextTilt = Math.round(
        ((clientY - bounds.top) / bounds.height) * 180 - 90
      );

      onChangeAngles(
        clamp(nextAngle, 0, GRADIENT_MAX_ANGLE),
        clamp(nextTilt, -90, 90)
      );
    },
    [onChangeAngles]
  );

  const onStartPreviewDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      onUpdatePreviewFromPointer(event.clientX, event.clientY);
    },
    [onUpdatePreviewFromPointer]
  );

  const onDragPreview = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.buttons !== 1) {
        return;
      }

      onUpdatePreviewFromPointer(event.clientX, event.clientY);
    },
    [onUpdatePreviewFromPointer]
  );

  const onCloseGradientColorPopover = useCallback(() => {
    setIsGradientColorPopoverOpen(false);
    setActiveGradientColorHandle(null);
  }, []);

  const onStartGradientHandlePointer = useCallback(
    (handle: GradientColorHandle) =>
      (event: PointerEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        onCloseGradientColorPopover();

        pendingGradientHandleDragRef.current = {
          handle,
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startedAt: performance.now(),
          hasDragged: false
        };
      },
    [onCloseGradientColorPopover]
  );

  const onDragGradientHandlePointer = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      const pendingGradientHandleDrag = pendingGradientHandleDragRef.current;

      if (
        !pendingGradientHandleDrag ||
        pendingGradientHandleDrag.pointerId !== event.pointerId ||
        event.buttons !== 1
      ) {
        return;
      }

      const movementDistance = Math.hypot(
        event.clientX - pendingGradientHandleDrag.startClientX,
        event.clientY - pendingGradientHandleDrag.startClientY
      );
      const elapsedTime =
        performance.now() - pendingGradientHandleDrag.startedAt;

      if (
        !pendingGradientHandleDrag.hasDragged &&
        movementDistance < GRADIENT_HANDLE_DRAG_DISTANCE &&
        elapsedTime < GRADIENT_HANDLE_DRAG_DELAY
      ) {
        return;
      }

      pendingGradientHandleDrag.hasDragged = true;
      onCloseGradientColorPopover();
      onUpdatePreviewFromPointer(event.clientX, event.clientY);
    },
    [onCloseGradientColorPopover, onUpdatePreviewFromPointer]
  );

  const onEndGradientHandlePointer = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      const pendingGradientHandleDrag = pendingGradientHandleDragRef.current;

      pendingGradientHandleDragRef.current = null;

      if (pendingGradientHandleDrag && !pendingGradientHandleDrag.hasDragged) {
        setActiveGradientColorHandle(pendingGradientHandleDrag.handle);
        setIsGradientColorPopoverOpen(true);
      }
    },
    []
  );

  const onCancelGradientHandlePointer = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      pendingGradientHandleDragRef.current = null;
    },
    []
  );

  const onStopGradientColorPopoverPointer = useCallback(
    (event: PointerEvent<Element>) => {
      event.stopPropagation();
    },
    []
  );

  const onChangeGradientColor = useCallback(
    ({ hex }: ColorResult) => {
      if (activeGradientColorHandle === 'start') {
        setGradientStartColor(hex);

        return;
      }

      if (activeGradientColorHandle === 'end') {
        setGradientEndColor(hex);
      }
    },
    [activeGradientColorHandle]
  );

  useEffect(() => {
    const dispose = signalEffect(() => {
      const geometry = createGradientPreviewGeometry(
        $gradientAngle.value,
        $gradientTilt.value
      );
      const previewElement = previewRef.current;
      const previewFillGradient = previewFillGradientRef.current;
      const barFillGradient = barFillGradientRef.current;
      const barOutlineGradient = barOutlineGradientRef.current;
      const barPolygon = barPolygonRef.current;

      if (
        !previewElement ||
        !previewFillGradient ||
        !barFillGradient ||
        !barOutlineGradient ||
        !barPolygon
      ) {
        return;
      }

      previewElement.style.setProperty(
        '--gradient-start-handle-left',
        geometry.startHandleLeft
      );
      previewElement.style.setProperty(
        '--gradient-start-handle-top',
        geometry.startHandleTop
      );
      previewElement.style.setProperty(
        '--gradient-start-handle-size',
        geometry.startHandleSize
      );
      previewElement.style.setProperty(
        '--gradient-start-handle-center-x',
        `${geometry.startCenterX}px`
      );
      previewElement.style.setProperty(
        '--gradient-start-handle-center-y',
        `${geometry.startCenterY}px`
      );
      previewElement.style.setProperty(
        '--gradient-start-handle-outline-opacity',
        geometry.startHandleOutlineOpacity
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-left',
        geometry.endHandleLeft
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-top',
        geometry.endHandleTop
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-size',
        geometry.endHandleSize
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-center-x',
        `${geometry.endCenterX}px`
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-center-y',
        `${geometry.endCenterY}px`
      );
      previewElement.style.setProperty(
        '--gradient-end-handle-outline-opacity',
        geometry.endHandleOutlineOpacity
      );

      previewFillGradient.setAttribute('x1', `${geometry.startCenterX}`);
      previewFillGradient.setAttribute('y1', `${geometry.startCenterY}`);
      previewFillGradient.setAttribute('x2', `${geometry.endCenterX}`);
      previewFillGradient.setAttribute('y2', `${geometry.endCenterY}`);
      barFillGradient.setAttribute('x1', `${geometry.startCenterX}`);
      barFillGradient.setAttribute('y1', `${geometry.startCenterY}`);
      barFillGradient.setAttribute('x2', `${geometry.endCenterX}`);
      barFillGradient.setAttribute('y2', `${geometry.endCenterY}`);
      barOutlineGradient.setAttribute('x1', `${geometry.startCenterX}`);
      barOutlineGradient.setAttribute('y1', `${geometry.startCenterY}`);
      barOutlineGradient.setAttribute('x2', `${geometry.endCenterX}`);
      barOutlineGradient.setAttribute('y2', `${geometry.endCenterY}`);
      barPolygon.setAttribute('points', geometry.barPoints);

      geometry.meshSegments.forEach((segment, index) => {
        const meshLine = meshLineRefs.current[index];

        if (!meshLine) {
          return;
        }

        meshLine.setAttribute('x1', `${segment.startX}`);
        meshLine.setAttribute('y1', `${segment.startY}`);
        meshLine.setAttribute('x2', `${segment.endX}`);
        meshLine.setAttribute('y2', `${segment.endY}`);
        meshLine.setAttribute('stroke-width', `${segment.strokeWidth}`);
        meshLine.setAttribute('opacity', `${segment.opacity}`);
      });
    });

    return dispose;
  }, [$gradientAngle, $gradientTilt]);

  return (
    <Box
      component='div'
      role='group'
      aria-label='Gradient direction preview'
      onPointerDown={onStartPreviewDrag}
      onPointerMove={onDragPreview}
      ref={previewRef}
      sx={{
        position: 'relative',
        display: 'block',
        width: 144,
        height: 144,
        aspectRatio: '1 / 1',
        mx: 'auto',
        p: 0,
        appearance: 'none',
        overflow: 'hidden',
        borderRadius: '50%',
        border: '1px solid var(--mui-palette-divider)',
        cursor: 'grab',
        touchAction: 'none',
        backgroundColor: 'transparent',
        boxShadow: '0 8px 18px rgba(0, 0, 0, 0.24)'
      }}
    >
      <Box
        component='svg'
        viewBox='0 0 144 144'
        preserveAspectRatio='none'
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <defs>
          <linearGradient
            id='gradient-preview-fill'
            gradientUnits='userSpaceOnUse'
            x1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterX}
            y1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterY}
            x2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterX}
            y2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterY}
            ref={previewFillGradientRef}
          >
            <stop offset='8%' stopColor={gradientStartColor} />
            <stop offset='92%' stopColor={gradientEndColor} />
          </linearGradient>
        </defs>
        <rect width='144' height='144' fill='url(#gradient-preview-fill)' />
      </Box>
      <Box
        component='svg'
        viewBox='0 0 144 144'
        preserveAspectRatio='none'
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 3,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        {DEFAULT_GRADIENT_PREVIEW_GEOMETRY.meshSegments.map(
          (segment, index) => {
            return (
              <line
                key={segment.id}
                ref={(element) => {
                  meshLineRefs.current[index] = element;
                }}
                x1={segment.startX}
                y1={segment.startY}
                x2={segment.endX}
                y2={segment.endY}
                fill='none'
                stroke='rgba(255, 255, 255, 0.86)'
                strokeLinecap='round'
                strokeWidth={segment.strokeWidth}
                opacity={segment.opacity}
              />
            );
          }
        )}
      </Box>
      <Box
        component='svg'
        viewBox='0 0 144 144'
        preserveAspectRatio='none'
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.28))',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <linearGradient
            id={GRADIENT_BAR_FILL_ID}
            gradientUnits='userSpaceOnUse'
            x1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterX}
            y1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterY}
            x2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterX}
            y2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterY}
            ref={barFillGradientRef}
          >
            <stop offset='0%' stopColor={gradientStartColor} />
            <stop offset='100%' stopColor={gradientEndColor} />
          </linearGradient>
          <linearGradient
            id={GRADIENT_BAR_OUTLINE_ID}
            gradientUnits='userSpaceOnUse'
            x1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterX}
            y1={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startCenterY}
            x2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterX}
            y2={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endCenterY}
            ref={barOutlineGradientRef}
          >
            <stop
              offset='0%'
              stopColor='rgba(255, 255, 255, 1)'
              stopOpacity={
                DEFAULT_GRADIENT_PREVIEW_GEOMETRY.startHandleOutlineOpacity
              }
            />
            <stop
              offset='100%'
              stopColor='rgba(255, 255, 255, 1)'
              stopOpacity={
                DEFAULT_GRADIENT_PREVIEW_GEOMETRY.endHandleOutlineOpacity
              }
            />
          </linearGradient>
        </defs>
        <polygon
          points={DEFAULT_GRADIENT_PREVIEW_GEOMETRY.barPoints}
          fill={`url(#${GRADIENT_BAR_FILL_ID})`}
          stroke={`url(#${GRADIENT_BAR_OUTLINE_ID})`}
          strokeLinejoin='round'
          strokeWidth={2}
          ref={barPolygonRef}
        />
      </Box>
      {GRADIENT_COLOR_HANDLE_CONFIGS.map(
        ({
          handle,
          ariaLabel,
          centerXProperty,
          centerYProperty,
          sizeProperty,
          outlineOpacityProperty,
          fallbackCenterX,
          fallbackCenterY,
          fallbackSize,
          fallbackOutlineOpacity
        }) => (
          <Box
            key={handle}
            component='button'
            type='button'
            aria-label={ariaLabel}
            onPointerDown={onStartGradientHandlePointer(handle)}
            onPointerMove={onDragGradientHandlePointer}
            onPointerUp={onEndGradientHandlePointer}
            onPointerCancel={onCancelGradientHandlePointer}
            sx={{
              position: 'absolute',
              left: `calc(var(${centerXProperty}, ${fallbackCenterX}px) - ${GRADIENT_HANDLE_HIT_AREA_SIZE / 2}px)`,
              top: `calc(var(${centerYProperty}, ${fallbackCenterY}px) - ${GRADIENT_HANDLE_HIT_AREA_SIZE / 2}px)`,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0,
              width: GRADIENT_HANDLE_HIT_AREA_SIZE,
              height: GRADIENT_HANDLE_HIT_AREA_SIZE,
              borderRadius: '50%',
              appearance: 'none',
              backgroundColor: 'transparent',
              border: 0,
              cursor: 'pointer',
              touchAction: 'none'
            }}
          >
            <Box
              component='span'
              sx={{
                width: `var(${sizeProperty}, ${fallbackSize})`,
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                backgroundColor: gradientColorByHandle[handle],
                border: '2px solid',
                borderColor: `rgba(255, 255, 255, var(${outlineOpacityProperty}, ${fallbackOutlineOpacity}))`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                pointerEvents: 'none'
              }}
            />
          </Box>
        )
      )}
      {!activeGradientColorHandle ? null : (
        <Popover
          open={isGradientColorPopoverOpen && Boolean(popoverAnchorEl)}
          anchorEl={popoverAnchorEl}
          onClose={onCloseGradientColorPopover}
          anchorOrigin={GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN}
          transformOrigin={GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN}
          onPointerDown={onStopGradientColorPopoverPointer}
          onPointerMove={onStopGradientColorPopoverPointer}
          onPointerUp={onStopGradientColorPopoverPointer}
          onPointerCancel={onStopGradientColorPopoverPointer}
          slotProps={{ paper: { sx: { ml: -1 } } }}
        >
          <SketchPicker
            color={activeGradientColor}
            onChange={onChangeGradientColor}
          />
        </Popover>
      )}
      {GRADIENT_AXIS_LABEL_CONFIGS.map(({ label, position }) => (
        <Box
          key={label}
          component='span'
          sx={{
            position: 'absolute',
            ...position,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: GRADIENT_AXIS_LABEL_SIZE,
            height: GRADIENT_AXIS_LABEL_SIZE,
            borderRadius: '50%',
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1,
            color: 'rgba(255, 255, 255, 0.95)',
            backgroundColor: 'rgba(0, 0, 0, 0.44)',
            border: '1px solid rgba(255, 255, 255, 0.38)'
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
});
