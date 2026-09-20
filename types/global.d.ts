export {};

declare global {
  interface Window {
    Intercom?: (command: string, ...args: unknown[]) => void;
  }
}
