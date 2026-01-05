import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix: Use interface augmentation to add API_KEY to the environment variables.
// This avoids the "Subsequent variable declarations must have the same type" error
// that occurs when redeclaring the global 'process' variable.
declare global {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
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
