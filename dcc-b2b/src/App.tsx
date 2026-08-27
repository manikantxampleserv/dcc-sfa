import React from 'react';
import ContextProvider from 'context';
import AppRoutes from 'routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <ContextProvider>
      <AppRoutes />
      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar 
        theme="colored"
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />
    </ContextProvider>
  );
};

export default App;
