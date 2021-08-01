import { createTheme, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import axios from 'axios';

import * as serviceWorker from './serviceWorkerRegistration';

const theme = createTheme({});

axios.defaults.baseURL = 'https://static.wsstack.nn4maws.net';

ReactDOM.render(
    <React.StrictMode>
        <MuiThemeProvider theme={theme}>
            <CssBaseline>
                <App />
            </CssBaseline>
        </MuiThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

serviceWorker.register();
