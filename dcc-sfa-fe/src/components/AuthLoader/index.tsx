/**
 * @fileoverview Authentication Loading Component
 * @description Shows loading state while authentication is being verified
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { Building2 } from 'lucide-react';
import React from 'react';

interface AuthLoaderProps {
  message?: string;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({
  message = 'Loading your profile...',
}) => {
  return (
    <Box className="!fixed !inset-0 !flex !flex-col !items-center !justify-center !bg-gray-50 !z-50">
      <Box className="!flex !items-center !gap-3 !mb-8">
        <Box className="!p-3 !bg-primary-100 !rounded-full">
          <Building2 className="w-8 h-8 text-primary-600" />
        </Box>
        <Typography variant="h4" className="!font-bold !text-gray-900">
          DCC-SFA
        </Typography>
      </Box>

      <Box className="!flex !flex-col !items-center !gap-4">
        <CircularProgress
          size={48}
          thickness={4}
          className="!text-primary-600"
        />

        <Typography variant="body1" className="!text-gray-600 !text-center">
          {message}
        </Typography>

        <Typography variant="caption" className="!text-gray-400 !text-center">
          Please wait while we verify your authentication...
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLoader;
