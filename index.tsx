
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix: Declare process using the 'Process' interface to merge with existing global definitions and avoid type mismatch errors.
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