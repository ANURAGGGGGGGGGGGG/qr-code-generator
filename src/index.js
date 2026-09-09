import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import QrGenerator from './QrGenerator';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QrGenerator />
  </React.StrictMode>
);
