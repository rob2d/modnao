import { observable } from '@legendapp/state';
import { JSX } from 'react';

export interface ErrorMessage {
  title: string;
  message: JSX.Element | string;
}

export const $messages = observable<ErrorMessage[]>([]);

export function resetErrorMessages() {
  $messages.set([]);
}

export function showError(payload: ErrorMessage) {
  $messages.set([...$messages.get(), payload]);
}

export function dismissError() {
  $messages.set($messages.get().slice(0, -1));
}
