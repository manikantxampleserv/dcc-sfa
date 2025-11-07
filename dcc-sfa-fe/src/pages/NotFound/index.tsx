import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Button from 'shared/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-full bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-6">
          <AlertCircle className="w-24 h-24 text-gray-400 mx-auto" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
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

export default NotFound;
