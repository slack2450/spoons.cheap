import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import axios from 'axios';

//import { register } from './serviceWorkerRegistration';
import * as serviceWorker from './serviceWorkerRegistration';

const theme = createTheme({});

axios.defaults.baseURL = 'https://static.wsstack.nn4maws.net';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <App />
      </CssBaseline>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
