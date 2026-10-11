import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { antdThemeConfig } from './styles';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={antdThemeConfig}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
