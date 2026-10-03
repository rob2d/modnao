import { signal } from '@preact-signals/safe-react';
import { JSX } from 'react';

export interface ErrorMessage {
  title: string;
  message: JSX.Element | string;
}

export interface ErrorMessagesState {
  messages: ErrorMessage[];
}

export const initialErrorMessagesState: ErrorMessagesState = {
  messages: []
};

export const $errorMessages = signal<ErrorMessagesState>(
  initialErrorMessagesState
);

export function showError(payload: ErrorMessage) {
  $errorMessages.value = {
    messages: [...$errorMessages.value.messages, payload]
  };
}

export function dismissError() {
  $errorMessages.value = {
    messages: $errorMessages.value.messages.slice(0, -1)
  };
}
