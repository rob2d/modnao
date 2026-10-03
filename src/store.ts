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
  errorMessages: $errorMessages.value,
  replaceTexture: $replaceTexture.value
});
export type AppState = ReturnType<typeof getState>;
/** Reset client state for a fresh session or an isolated test. Never call during SSR. */
export function resetState(preloadedState: Partial<AppState> = {}) {
  batch(() => {
    $errorMessages.value = preloadedState.errorMessages ?? {
      ...initialErrorMessagesState
    };
    $replaceTexture.value = preloadedState.replaceTexture ?? {
      ...initialReplaceTextureState
    };
  });
}
