import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import {
  MathUtils,
  OrthographicCamera,
  PerspectiveCamera,
  Spherical,
  Vector3
} from 'three';

const sceneCameraControlParams = {
  baseDollyVelocity: 0.225,
  boundsFitMargin: 1.15,
  dollyVelocityByDistanceRoot: 0.06,
  flyLookDistance: 1,
  flyTransitionEndDistance: 1,
  flyTransitionStartDistance: 8,
  minFocusDistance: 1,
  panSpeed: 1,
  rotateSpeed: 0.005
};
const cameraControlMinPolarAngle = 0.000001;
const cameraControlMaxPolarAngle = Math.PI - cameraControlMinPolarAngle;
const wheelLineHeightPixels = 16;

type CameraPointerAction = 'pan' | 'rotate';

interface CameraPointerDrag {
  action: CameraPointerAction;
  clientX: number;
  clientY: number;
  pointerId: number;
}

interface CameraPointerPosition {
  clientX: number;
  clientY: number;
}

interface CameraTouchGesture {
  centerX: number;
  centerY: number;
  distance: number;
}

interface SceneCameraControlsProps {
  mainBounds?: ModelBounds;
}

export default function SceneCameraControls({
  mainBounds
}: SceneCameraControlsProps) {
  const { camera, gl, invalidate, size } = useThree();
  const dragRef = useRef<CameraPointerDrag | null>(null);
  const touchGestureRef = useRef<CameraTouchGesture | null>(null);
  const targetRef = useRef(new Vector3());
  const offsetRef = useRef(new Vector3());
  const panRef = useRef(new Vector3());
  const forwardRef = useRef(new Vector3());
  const flyLookTargetRef = useRef(new Vector3());
  const hybridLookTargetRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const upRef = useRef(new Vector3());
  const targetOffsetRef = useRef(new Vector3());
  const touchPointersRef = useRef(new Map<number, CameraPointerPosition>());
  const sphericalRef = useRef(new Spherical());
  const boundsTargetRef = useRef(new Vector3());
  const boundsPanRef = useRef(new Vector3());
  const autoFitMainBoundsRef = useRef<ModelBounds | undefined>(undefined);

  useEffect(() => {
    if (!mainBounds) {
      autoFitMainBoundsRef.current = undefined;
      return;
    }

    if (autoFitMainBoundsRef.current === mainBounds) {
      return;
    }

    autoFitMainBoundsRef.current = mainBounds;

    const target = targetRef.current;
    const nextTarget = boundsTargetRef.current.set(
      mainBounds.center[0],
      mainBounds.center[1],
      mainBounds.min[2]
    );
    const pan = boundsPanRef.current.subVectors(nextTarget, target);

    camera.position.add(pan);
    target.copy(nextTarget);

    if (camera instanceof PerspectiveCamera) {
      const verticalHalfFov = MathUtils.degToRad(camera.fov / 2);
      const aspectRatio = size.height === 0 ? 1 : size.width / size.height;
      const verticalTangent = Math.tan(verticalHalfFov);
      const horizontalTangent = verticalTangent * aspectRatio;
      const forward = camera.getWorldDirection(forwardRef.current);
      const right = rightRef.current
        .set(1, 0, 0)
        .applyQuaternion(camera.quaternion);
      const up = upRef.current.set(0, 1, 0).applyQuaternion(camera.quaternion);
      const fitDistance = Math.max(
        ...[
          mainBounds.min,
          mainBounds.max,
          [mainBounds.min[0], mainBounds.min[1], mainBounds.max[2]],
          [mainBounds.min[0], mainBounds.max[1], mainBounds.min[2]],
          [mainBounds.max[0], mainBounds.min[1], mainBounds.min[2]],
          [mainBounds.min[0], mainBounds.max[1], mainBounds.max[2]],
          [mainBounds.max[0], mainBounds.min[1], mainBounds.max[2]],
          [mainBounds.max[0], mainBounds.max[1], mainBounds.min[2]]
        ].map((corner) => {
          const offset = new Vector3(
            corner[0] - nextTarget.x,
            corner[1] - nextTarget.y,
            corner[2] - nextTarget.z
          );
          const horizontalDistance =
            Math.abs(offset.dot(right)) / horizontalTangent;
          const verticalDistance = Math.abs(offset.dot(up)) / verticalTangent;
          const depthOffset = offset.dot(forward);

          return Math.max(horizontalDistance, verticalDistance) - depthOffset;
        }),
        sceneCameraControlParams.minFocusDistance
      );

      camera.position
        .copy(target)
        .addScaledVector(
          forward,
          -fitDistance * sceneCameraControlParams.boundsFitMargin
        );
    }

    invalidate();
  }, [camera, invalidate, mainBounds, size.height, size.width]);

  useEffect(() => {
    const domElement = gl.domElement;

    const rotateCamera = (deltaX: number, deltaY: number) => {
      const target = targetRef.current;
      const offset = offsetRef.current.subVectors(camera.position, target);
      const spherical = sphericalRef.current.setFromVector3(offset);

      spherical.theta -= deltaX * sceneCameraControlParams.rotateSpeed;
      spherical.phi = MathUtils.clamp(
        spherical.phi - deltaY * sceneCameraControlParams.rotateSpeed,
        cameraControlMinPolarAngle,
        cameraControlMaxPolarAngle
      );

      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
      invalidate();
    };

    const panCamera = (deltaX: number, deltaY: number) => {
      const target = targetRef.current;
      const focusDistance = Math.max(
        camera.position.distanceTo(target),
        sceneCameraControlParams.minFocusDistance
      );
      let worldUnitsPerPixel = focusDistance / size.height;

      if (camera instanceof PerspectiveCamera) {
        worldUnitsPerPixel =
          (2 * focusDistance * Math.tan(MathUtils.degToRad(camera.fov / 2))) /
          size.height;
      } else if (camera instanceof OrthographicCamera) {
        worldUnitsPerPixel =
          (camera.top - camera.bottom) / camera.zoom / size.height;
      }

      const panScale = worldUnitsPerPixel * sceneCameraControlParams.panSpeed;
      const right = rightRef.current
        .set(1, 0, 0)
        .applyQuaternion(camera.quaternion);
      const up = upRef.current.set(0, 1, 0).applyQuaternion(camera.quaternion);
      const pan = panRef.current
        .copy(right)
        .multiplyScalar(-deltaX * panScale)
        .addScaledVector(up, deltaY * panScale);

      camera.position.add(pan);
      target.add(pan);
      camera.lookAt(target);
      invalidate();
    };

    const getDollyVelocity = (focusDistance: number) =>
      sceneCameraControlParams.baseDollyVelocity +
      Math.sqrt(focusDistance) *
        sceneCameraControlParams.dollyVelocityByDistanceRoot;

    const getHybridLookTarget = (target: Vector3, forward: Vector3) => {
      const focusDepth = targetOffsetRef.current
        .subVectors(target, camera.position)
        .dot(forward);
      const inspectTargetBlend = MathUtils.smoothstep(
        focusDepth,
        sceneCameraControlParams.flyTransitionEndDistance,
        sceneCameraControlParams.flyTransitionStartDistance
      );
      const flyLookTarget = flyLookTargetRef.current
        .copy(camera.position)
        .addScaledVector(forward, sceneCameraControlParams.flyLookDistance);

      return hybridLookTargetRef.current
        .copy(flyLookTarget)
        .lerp(target, inspectTargetBlend);
    };

    const dollyCamera = (deltaY: number) => {
      const target = targetRef.current;
      const forward = camera.getWorldDirection(forwardRef.current);
      const focusDistance = Math.max(
        camera.position.distanceTo(target),
        sceneCameraControlParams.minFocusDistance
      );
      const dollyVelocity = getDollyVelocity(focusDistance);
      const moveDistance = -deltaY * dollyVelocity;

      camera.position.addScaledVector(forward, moveDistance);
      camera.lookAt(getHybridLookTarget(target, forward));
      invalidate();
    };

    const getWheelDeltaY = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * wheelLineHeightPixels;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * size.height;
      }

      return event.deltaY;
    };

    const getTouchGesture = () => {
      const touchPointers = Array.from(touchPointersRef.current.values());
      const [firstPointer, secondPointer] = touchPointers;

      if (!firstPointer || !secondPointer) {
        return null;
      }

      return {
        centerX: (firstPointer.clientX + secondPointer.clientX) / 2,
        centerY: (firstPointer.clientY + secondPointer.clientY) / 2,
        distance: Math.hypot(
          secondPointer.clientX - firstPointer.clientX,
          secondPointer.clientY - firstPointer.clientY
        )
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button > 2) {
        return;
      }

      if (event.pointerType === 'touch') {
        touchPointersRef.current.set(event.pointerId, {
          clientX: event.clientX,
          clientY: event.clientY
        });
        domElement.setPointerCapture(event.pointerId);

        if (touchPointersRef.current.size > 1) {
          touchGestureRef.current = getTouchGesture();
          dragRef.current = null;
          event.preventDefault();
          return;
        }
      }

      const action = event.shiftKey || event.button !== 0 ? 'pan' : 'rotate';
      dragRef.current = {
        action,
        clientX: event.clientX,
        clientY: event.clientY,
        pointerId: event.pointerId
      };
      domElement.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        const touchPointers = touchPointersRef.current;

        if (touchPointers.has(event.pointerId)) {
          touchPointers.set(event.pointerId, {
            clientX: event.clientX,
            clientY: event.clientY
          });
        }

        if (touchPointers.size > 1) {
          const nextTouchGesture = getTouchGesture();
          const previousTouchGesture = touchGestureRef.current;

          if (nextTouchGesture && previousTouchGesture) {
            const centerDeltaX =
              nextTouchGesture.centerX - previousTouchGesture.centerX;
            const centerDeltaY =
              nextTouchGesture.centerY - previousTouchGesture.centerY;
            const distanceDelta =
              previousTouchGesture.distance - nextTouchGesture.distance;

            if (centerDeltaX !== 0 || centerDeltaY !== 0) {
              panCamera(centerDeltaX, centerDeltaY);
            }

            if (distanceDelta !== 0) {
              dollyCamera(distanceDelta);
            }
          }

          touchGestureRef.current = nextTouchGesture;
          event.preventDefault();
          return;
        }
      }

      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      if (event.buttons === 0) {
        dragRef.current = null;
        return;
      }

      const deltaX = event.clientX - drag.clientX;
      const deltaY = event.clientY - drag.clientY;

      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      if (drag.action === 'pan') {
        panCamera(deltaX, deltaY);
      } else {
        rotateCamera(deltaX, deltaY);
      }

      drag.clientX = event.clientX;
      drag.clientY = event.clientY;
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        touchPointersRef.current.delete(event.pointerId);
        touchGestureRef.current =
          touchPointersRef.current.size > 1 ? getTouchGesture() : null;
      }

      if (domElement.hasPointerCapture(event.pointerId)) {
        domElement.releasePointerCapture(event.pointerId);
      }

      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      dragRef.current = null;
      event.preventDefault();
    };

    const onWheel = (event: WheelEvent) => {
      dollyCamera(getWheelDeltaY(event));
      event.preventDefault();
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    camera.lookAt(targetRef.current);
    invalidate();
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('contextmenu', onContextMenu);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('contextmenu', onContextMenu);
    };
  }, [camera, gl, invalidate, size.height]);

  return null;
}
