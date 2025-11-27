import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from 'shared/Button';
import { UnauthorizedIcon } from '../../resources';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-full bg-gray-50">
      <div className="text-center px-4">
        <div className="flex justify-center">
          <UnauthorizedIcon />
        </div>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
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

export default Unauthorized;
