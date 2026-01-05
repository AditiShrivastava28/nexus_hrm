import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Global declaration for process.env.API_KEY.
 * This satisfies both the TS compiler and the build environment.
 * We augment the existing Process and ProcessEnv interfaces to avoid type conflicts
 * with standard environment types while providing access to API_KEY.
 */
declare global {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
  var process: Process;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);