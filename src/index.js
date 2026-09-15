import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Registers dayjs plugins (customParseFormat, isBetween, isSameOrAfter/
// Before, buddhistEra) before anything else in the app runs - see the
// comment in theme/DateTH.js for why this can't be left to load lazily.
import './theme/DateTH';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BasicDataProvider } from './server/provider/BasicDataProvider';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <BasicDataProvider>
        <App />
      </BasicDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
