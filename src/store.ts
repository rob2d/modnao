import { $dialogs, initialDialogsState } from '@/modules/dialogs/dialogsStore';
import {
  $errorMessages,
  initialErrorMessagesState
} from '@/modules/error-messages/errorMessagesStore';
import {
  $replaceTexture,
  initialReplaceTextureState
} from '@/modules/replace-texture/replaceTextureStore';
import { batch } from '@preact-signals/safe-react';

export const getState = () => ({
  dialogs: $dialogs.value,
  errorMessages: $errorMessages.value,
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
    $replaceTexture.value = preloadedState.replaceTexture ?? {
      ...initialReplaceTextureState
    };
  });
}
