import { $dialogs, initialDialogsState } from '@/modules/dialogs/dialogsStore';
import {
  $errorMessages,
  initialErrorMessagesState
} from '@/modules/error-messages/errorMessagesStore';
import {
  $modelData,
  initialModelDataState
} from '@/modules/model-data/modelDataStore';
import {
  $meshDisplayMode,
  $meshSelectionType,
  $modelIndex,
  $selectedObjectIds,
  $textureIndex
} from '@/modules/object-viewer/objectViewerStore';
import {
  $replaceTexture,
  initialReplaceTextureState
} from '@/modules/replace-texture/replaceTextureStore';
import { batch } from '@preact-signals/safe-react';

export const getState = () => ({
  dialogs: $dialogs.value,
  errorMessages: $errorMessages.value,
  modelData: $modelData.value,
  objectViewer: {
    modelIndex: $modelIndex.value,
    textureIndex: $textureIndex.value,
    selectedIds: $selectedObjectIds.value,
    meshSelectionType: $meshSelectionType.value,
    meshDisplayMode: $meshDisplayMode.value
  },
  replaceTexture: $replaceTexture.value
});
export type AppState = ReturnType<typeof getState>;
/** Reset client state for a fresh session or an isolated test. Never call during SSR. */
export function resetState(preloadedState: Partial<AppState> = {}) {
  batch(() => {
    $dialogs.value = preloadedState.dialogs ?? { ...initialDialogsState };
    $errorMessages.value = preloadedState.errorMessages ?? {
      ...initialErrorMessagesState
    };
    $modelData.value = preloadedState.modelData ?? { ...initialModelDataState };
    const objectViewer = preloadedState.objectViewer;

    $modelIndex.value = objectViewer ? objectViewer.modelIndex : -1;
    $textureIndex.value = objectViewer ? objectViewer.textureIndex : -1;
    $selectedObjectIds.value = objectViewer ? objectViewer.selectedIds : {};
    $meshSelectionType.value = objectViewer
      ? objectViewer.meshSelectionType
      : 'mesh';
    $meshDisplayMode.value = objectViewer
      ? objectViewer.meshDisplayMode
      : 'textured';
    $replaceTexture.value = preloadedState.replaceTexture ?? {
      ...initialReplaceTextureState
    };
  });
}
