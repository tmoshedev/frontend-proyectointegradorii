/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    bootstrap: any;
    refreshKanban?: () => void;

  }
}

declare module 'bootstrap';
