import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { AppProviders } from './app/providers/AppProviders';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
