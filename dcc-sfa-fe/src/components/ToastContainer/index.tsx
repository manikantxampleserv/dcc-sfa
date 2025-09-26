/**
 * ## ToastContainer Component
 *
 * Global toast container with custom styling that matches the application theme.
 * Integrates with react-toastify and provides consistent notification styling.
 */

import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * ToastContainer component with application-specific styling
 * @returns JSX.Element - Configured toast container
 */
const ToastContainer: React.FC = () => {
  return (
    <ReactToastifyContainer
      position="top-right"
      autoClose={3000}
      closeOnClick
      draggable
      theme="light"
    />
  );
};

export default ToastContainer;
