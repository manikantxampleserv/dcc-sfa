import useOnlineStatus from 'hooks/useOnlineStatus';
import { Home, RefreshCw } from 'lucide-react';
import React, { useEffect } from 'react';
import { NoConnectionIcon } from 'resources';
import Button from 'shared/Button';

/**
 * NoConnection component displays when the application loses internet connectivity
 *
 * This component monitors the online/offline status and provides users with:
 * - Visual feedback about connection status
 * - Options to retry connection, go back, or return home
 * - Automatic page reload when connection is restored (after 5 seconds)
 *
 * @component
 * @example
 * return (
 *   <NoConnection />
 * )
 */
const NoConnection: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  /**
   * Auto-reload effect when connection is restored
   * Waits 5 seconds after connection is restored before reloading the page
   */
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  /**
   * Handles retry action by reloading the page
   */
  const handleRetry = () => {
    window.location.reload();
  };

  /**
   * Handles go back action
   * Navigates to previous page if history exists, otherwise redirects to home
   */
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex items-center justify-center bg-white fixed inset-0 w-screen h-screen">
      <div className="text-center max-w-lg w-full p-6">
        <div className="flex justify-center items-center">
          <NoConnectionIcon />
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-2">
          {isOnline ? 'Connection Restored!' : 'No Internet Connection'}
        </h1>

        <p className="text-gray-600 mb-4">
          {isOnline
            ? 'Your connection has been restored. Redirecting...'
            : 'Unable to connect to the server. Please check your internet connection and try again.'}
        </p>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outlined"
            onClick={handleGoBack}
            className="!capitalize text-sm py-2"
            disabled={isOnline}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            onClick={handleRetry}
            startIcon={<RefreshCw className="w-3 h-3" />}
            className="!capitalize text-sm py-2"
            disabled={isOnline}
          >
            {isOnline ? 'Connecting...' : 'Retry'}
          </Button>

          <Button
            variant="contained"
            onClick={() => (window.location.href = '/')}
            startIcon={<Home className="w-3 h-3" />}
            className="!capitalize text-sm py-2"
            disabled={isOnline}
          >
            Go Home
          </Button>
        </div>

        {isOnline && (
          <div className="mt-4 p-2 bg-green-50 text-green-700 rounded text-xs">
            Connection restored! Page is reloading...
          </div>
        )}
      </div>
    </div>
  );
};

export default NoConnection;
