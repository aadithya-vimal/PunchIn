import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { UserProvider } from './context/UserContext.jsx';
import { AIProvider } from './context/AIContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <AIProvider>
        <App />
      </AIProvider>
    </UserProvider>
  </React.StrictMode>
);