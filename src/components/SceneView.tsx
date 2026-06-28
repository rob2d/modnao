import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { signal, effect as signalEffect } from '@preact/signals-react';
import { Canvas } from '@react-three/fiber';
import {
  selectAllDisplayedMeshes,
  selectDisplayedMeshes,
  selectMeshSelectionType,
  selectModel,
  selectModelIndex,
  selectPolygonBufferKey,
  selectSelectedObjectIds,
  selectUpdatedTextureDefs
} from '@/selectors';
import {
  addObjectKeys,
  removeObjectKeys,
  setObjectKeys,
  setSelectedTextureIndex
} from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { useObjectNavControls } from '@/modules/object-viewer';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { SceneContextSetup } from '@/contexts/SceneContext';
import { useLassoPath, useSceneTextureMapCache } from '@/hooks';
import {
  EffectComposer,
  Outline,
  Selection
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { ColorManagement, SRGBColorSpace, WebGLRenderer } from 'three';
import RenderedPolygon from './scene/RenderedPolygon';
import SceneLassoOverlay from './scene/SceneLassoOverlay';
import SceneCameraControls from './scene/SceneCameraControls';
import SceneVertexLassoSelection from './scene/SceneVertexLassoSelection';
import type { SceneVertexInteractionMode } from './scene/SceneVertexModeControls';
import ModelResourceAttribs from '@/modules/object-viewer/components/ModelResourceAttribs';
import type { NodeSelectionMergeMode } from '@/types';
import type { InteractionPoint } from '@/utils/interaction';

ColorManagement.enabled = true;

const cameraParams = { near: 0.1, far: 5000000 };
const canvasResizeParams = { debounce: 125 };

const axesHelper = <axesHelper args={[50]} />;

// temporary until introducing general icons for cursor variants
const $selectionMergeIndicatorPosition = signal({
  pointerX: -100,
  pointerY: -100
});

interface SceneViewProps {
  vertexInteractionMode: SceneVertexInteractionMode;
}

export default function SceneView({ vertexInteractionMode }: SceneViewProps) {
  useObjectNavControls();

  const [cameraPositionMoved, setCameraPositionMoved] = useState(false);
  const [resetCameraPositionRevision, setResetCameraPositionRevision] =
    useState(0);
  const [completedLassoSelection, setCompletedLassoSelection] = useState<{
    points: InteractionPoint[];
    selectionMergeMode: NodeSelectionMergeMode;
  }>();
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isScenePointerInside, setIsScenePointerInside] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionMergeIndicatorRef = useRef<HTMLDivElement>(null);
  const isScenePointerInsideRef = useRef(false);
  const sceneBoundsRef = useRef<DOMRect | undefined>(undefined);
  const sceneOptions = useContext(SceneOptionsContext);

  const dispatch = useAppDispatch();
  const selectedObjectIds = useAppSelector(selectSelectedObjectIds);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const onSelectObjectKey = useCallback(
    (
      key: string,
      textureIndex: number,
      selectionMergeMode: NodeSelectionMergeMode
    ) => {
      const selectedObjectCount = Object.keys(selectedObjectIds).length;
      const isOnlySelectedObject =
        selectedObjectCount === 1 && selectedObjectIds[key] === true;

      if (selectionMergeMode === 'remove') {
        dispatch(removeObjectKeys([key]));
      } else if (selectionMergeMode === 'add') {
        dispatch(addObjectKeys([key]));
      } else {
        dispatch(setObjectKeys(isOnlySelectedObject ? [] : [key]));
      }

      if (selectionMergeMode !== 'remove') {
        dispatch(setSelectedTextureIndex(textureIndex));
      }
    },
    [dispatch, selectedObjectIds]
  );

  const onResetCameraPosition = useCallback(() => {
    setResetCameraPositionRevision((revision) => revision + 1);
  }, []);

  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const textureCacheMap = useSceneTextureMapCache(textureDefs);
  const model = useAppSelector(selectModel);
  const theme = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        if (isScenePointerInsideRef.current) {
          event.preventDefault();
        }

        setIsAltPressed(true);
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        if (isScenePointerInsideRef.current) {
          event.preventDefault();
        }

        setIsAltPressed(false);
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    const handleWindowBlur = () => {
      setIsAltPressed(false);
      setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  const canvasStyle = useMemo(() => {
    let cursor = 'default';

    if (!sceneOptions.sceneCursorVisible) {
      cursor = 'none';
    }

    return {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      touchAction: 'none',
      userSelect: 'none' as const,
      background: theme.palette.scene.background,
      cursor
    };
  }, [sceneOptions.sceneCursorVisible, theme.palette.scene.background]);

  useEffect(
    () =>
      signalEffect(() => {
        const indicator = selectionMergeIndicatorRef.current;

        if (!indicator) {
          return;
        }

        const { pointerX, pointerY } = $selectionMergeIndicatorPosition.value;
        indicator.style.transform = `translate(${pointerX + 6}px, ${pointerY + 4}px)`;
      }),
    []
  );

  const onScenePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const sceneBounds = event.currentTarget.getBoundingClientRect();
      const pointerX = event.clientX - sceneBounds.left;
      const pointerY = event.clientY - sceneBounds.top;

      sceneBoundsRef.current = sceneBounds;
      $selectionMergeIndicatorPosition.value = { pointerX, pointerY };

      isScenePointerInsideRef.current = true;
      setIsScenePointerInside(true);
    },
    []
  );

  const onScenePointerLeave = useCallback(() => {
    isScenePointerInsideRef.current = false;
    setIsScenePointerInside(false);
  }, []);

  const onScenePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const sceneBounds =
        sceneBoundsRef.current ?? event.currentTarget.getBoundingClientRect();
      const pointerX = event.clientX - sceneBounds.left;
      const pointerY = event.clientY - sceneBounds.top;

      $selectionMergeIndicatorPosition.value = { pointerX, pointerY };
    },
    []
  );

  const hasSelectedObjects = Object.keys(selectedObjectIds).length > 0;
  let selectionMergeIndicatorText: string | undefined;

  if (isAltPressed && hasSelectedObjects) {
    selectionMergeIndicatorText = '-';
  } else if (isShiftPressed && hasSelectedObjects) {
    selectionMergeIndicatorText = '+';
  }

  const selectionMergeIndicatorVisible =
    isScenePointerInside &&
    sceneOptions.sceneCursorVisible &&
    selectionMergeIndicatorText !== undefined;

  const selectedMeshes = useAppSelector(selectDisplayedMeshes);
  const meshes = useAppSelector(selectAllDisplayedMeshes);
  const modelIndex = useAppSelector(selectModelIndex);
  const polygonBufferKey = useAppSelector(selectPolygonBufferKey);
  const lassoEnabled =
    meshSelectionType === 'vertex' && vertexInteractionMode === 'select';
  const onCompleteLasso = useCallback(
    (points: InteractionPoint[], selectionMergeMode: NodeSelectionMergeMode) =>
      setCompletedLassoSelection({
        points: [...points],
        selectionMergeMode
      }),
    []
  );
  const onSelectVertexKeys = useCallback(
    (vertexKeys: string[], selectionMergeMode: NodeSelectionMergeMode) => {
      if (selectionMergeMode === 'remove') {
        dispatch(removeObjectKeys(vertexKeys));
      } else if (selectionMergeMode === 'add') {
        dispatch(addObjectKeys(vertexKeys));
      } else {
        dispatch(setObjectKeys(vertexKeys));
      }

      setCompletedLassoSelection(undefined);
    },
    [dispatch]
  );
  const { isLassoActive, lassoPoints } = useLassoPath(canvasRef, {
    enabled: lassoEnabled,
    onComplete: onCompleteLasso
  });
  const renderedMeshGroups = sceneOptions.renderAllModels
    ? meshes
    : [selectedMeshes];
  const axesHelperVisible =
    sceneOptions.axesHelperVisible && !sceneOptions.enableCinematicMode;
  const selectionEnabled =
    sceneOptions.meshDisplayMode !== 'wireframe' &&
    Object.keys(selectedObjectIds).length > 0 &&
    !sceneOptions.renderAllModels;

  const renderedModels = useMemo(
    () =>
      renderedMeshGroups.map((ms, msi) => (
        <mesh
          key={`meshGroup_${msi}_${sceneOptions.renderAllModels ? 1 : 0}`}
          position={
            !sceneOptions.renderAllModels ? [0, 0, 0] : [msi * 500, msi * 50, 0]
          }
        >
          {ms.map((m, i) => {
            const texture =
              textureCacheMap?.get(m.textureHash)?.texture || null;
            return m.polygons.map((p, pIndex) => (
              <RenderedPolygon
                {...p}
                key={`${m.address}_${p.address}`}
                objectKey={
                  meshSelectionType === 'mesh' ? `${i}` : `${i}_${pIndex}`
                }
                textureIndex={m.textureIndex}
                selectedObjectIds={selectedObjectIds}
                onSelectObjectKey={onSelectObjectKey}
                texture={texture}
                vertexSelectionMode={meshSelectionType === 'vertex'}
              />
            ));
          })}
        </mesh>
      )),
    [
      model,
      renderedMeshGroups,
      textureCacheMap,
      selectedObjectIds,
      meshSelectionType,
      onSelectObjectKey
    ]
  );

  const onSceneCreated = useCallback(({ gl }: { gl: WebGLRenderer }) => {
    gl.outputColorSpace = SRGBColorSpace;
  }, []);
  const resetCameraPositionButtonHidden =
    sceneOptions.enableCinematicMode || !cameraPositionMoved;

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <ModelResourceAttribs />
      </Box>
      <Tooltip
        title='Reset camera position'
        disableInteractive={resetCameraPositionButtonHidden}
        placement='left'
      >
        <IconButton
          aria-label='Reset camera position'
          color='info'
          onClick={onResetCameraPosition}
          sx={(theme) => ({
            position: 'absolute',
            right: 0,
            bottom: 0,
            mr: 13,
            mb: 1,
            zIndex: 1,
            transition: 'opacity 0.5s ease',
            opacity: resetCameraPositionButtonHidden ? 0 : 1,
            pointerEvents: resetCameraPositionButtonHidden ? 'none' : 'all',
            '& svg': theme.mixins.sceneIconMixin
          })}
        >
          <CenterFocusStrongIcon fontSize='medium' />
        </IconButton>
      </Tooltip>
      <Canvas
        resize={canvasResizeParams}
        camera={cameraParams}
        frameloop='demand'
        style={canvasStyle}
        ref={canvasRef}
        onPointerEnter={onScenePointerEnter}
        onPointerLeave={onScenePointerLeave}
        onPointerMove={onScenePointerMove}
        onCreated={onSceneCreated}
      >
        <Selection enabled={selectionEnabled}>
          <SceneContextSetup />
          <EffectComposer autoClear={false} enabled={selectionEnabled}>
            <Outline
              edgeStrength={30}
              pulseSpeed={1}
              blendFunction={BlendFunction.SCREEN}
              visibleEdgeColor={
                theme.palette.scene.selected as unknown as number
              }
              hiddenEdgeColor={
                theme.palette.scene.selected as unknown as number
              }
            />
          </EffectComposer>
          <group>
            {!axesHelperVisible ? undefined : axesHelper}
            {renderedModels}
          </group>
          <SceneCameraControls
            mainBounds={model?.mainBounds}
            modelIndex={modelIndex}
            onCameraPositionMovedChange={setCameraPositionMoved}
            polygonBufferKey={polygonBufferKey}
            controlSceneCamera={vertexInteractionMode === 'camera'}
            resetCameraPositionRevision={resetCameraPositionRevision}
          />
          <SceneVertexLassoSelection
            lassoPoints={completedLassoSelection?.points}
            meshGroups={renderedMeshGroups}
            renderAllModels={sceneOptions.renderAllModels}
            selectionMergeMode={
              completedLassoSelection?.selectionMergeMode ?? 'replace'
            }
            onSelectVertexKeys={onSelectVertexKeys}
          />
        </Selection>
      </Canvas>
      <Box
        ref={selectionMergeIndicatorRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          width: 0,
          height: 0,
          display: selectionMergeIndicatorVisible ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          color: 'var(--mui-palette-secondary-light)',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1,
          transform: 'translate(-100px, -100px)',
          whiteSpace: 'nowrap',
          userSelect: 'none'
        }}
      >
        {selectionMergeIndicatorText}
      </Box>
      {!lassoEnabled ? null : (
        <SceneLassoOverlay isActive={isLassoActive} points={lassoPoints} />
      )}
    </>
  );
}
