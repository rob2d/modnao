import { signal } from '@preact-signals/safe-react';
import { JSX } from 'react';

export interface ErrorMessage {
  title: string;
  message: JSX.Element | string;
}

export const $messages = signal<ErrorMessage[]>([]);

export function resetErrorMessages() {
  $messages.value = [];
}

export function showError(payload: ErrorMessage) {
  $messages.value = [...$messages.value, payload];
}

export function dismissError() {
  $messages.value = $messages.value.slice(0, -1);
}
