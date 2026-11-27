import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { MockDataProvider } from './MockDataContext';
import ThemeContext from './ThemeContext';

/** Root context provider combining all providers */
const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <BrowserRouter>
      <ThemeContext>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            <MockDataProvider>{children}</MockDataProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeContext>
    </BrowserRouter>
  );
};

export default ContextProvider;
