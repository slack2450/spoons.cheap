import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


const theme = createTheme({});

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