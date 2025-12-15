import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';
import Button from 'shared/Button';
import { NoConnectionIcon } from '../../resources';

const NoConnection: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-6 flex justify-center">
          <NoConnectionIcon />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          No Internet Connection
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Unable to connect to the server. Please check your internet connection
          and try again.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            className="!capitalize"
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={handleRetry}
            startIcon={<RefreshCw className="w-4 h-4" />}
            className="!capitalize"
          >
            Retry
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<Home className="w-4 h-4" />}
            className="!capitalize"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoConnection;
