// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'ag-grid-enterprise';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// 반드시 모든 다른 코드보다 먼저 실행되어야 합니다.
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// React 18 방식으로 createRoot를 사용하여 렌더링합니다.
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
