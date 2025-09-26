/**
 * ## Login Page
 *
 * Professional login page with form validation and authentication integration.
 * Built with MUI components, Formik validation, and integrated with DCC-SFA auth system.
 *
 * #### Features
 * - Email/password authentication
 * - Form validation with Formik & Yup
 * - Loading states and error handling
 * - Responsive design with modern UI
 * - Remember me functionality
 * - Password visibility toggle
 * - Integration with auth service and token management
 */

import { Login as LoginIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService, { type LoginRequest } from 'services/auth/authService';
import { useLogin } from 'hooks/useAuth';
import Button from 'shared/Button';
import Input from 'shared/Input';
import * as Yup from 'yup';

/**
 * Validation schema for login form
 */
const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

/**
 * Interface for login form values
 */
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Login Page Component
 * @returns JSX.Element - Rendered login page
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  // Login mutation with React Query
  const loginMutation = useLogin({
    onSuccess: response => {
      if (response.success) {
        setError(null);
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    },
    onError: (err: any) => {
      setError(err.message || 'An error occurred during login');
    },
  });

  /**
   * Check if user is already authenticated
   */
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  /**
   * Formik configuration for login form
   */
  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async values => {
      await handleLogin(values);
    },
  });

  /**
   * Handles login form submission
   * @param values - Form values containing email and password
   */
  const handleLogin = async (values: LoginFormValues) => {
    setError(null);

    // Store remember me preference
    if (values.rememberMe) {
      localStorage.setItem('dcc_sfa_remember_email', values.email);
    } else {
      localStorage.removeItem('dcc_sfa_remember_email');
    }

    const loginData: LoginRequest = {
      email: values.email,
      password: values.password,
    };

    // Use React Query mutation
    loginMutation.mutate(loginData);
  };

  /**
   * Load remembered email on component mount
   */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('dcc_sfa_remember_email');
    if (rememberedEmail) {
      formik.setFieldValue('email', rememberedEmail);
      formik.setFieldValue('rememberMe', true);
    }
  }, []);

  return (
    <Box className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <Box className="text-center mb-8">
            <Box className="mb-4">
              <LoginIcon className="!text-6xl !text-primary-600" />
            </Box>
            <Typography
              variant="h4"
              className="!font-bold !text-gray-900 !mb-2"
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" className="!text-gray-600">
              Sign in to your DCC-SFA account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="!mb-6">
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            {/* Email Field */}
            <Box className="mb-4">
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                formik={formik}
                autoComplete="email"
                autoFocus
              />
            </Box>

            {/* Password Field */}
            <Box className="mb-4">
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                formik={formik}
                autoComplete="current-password"
              />
            </Box>

            {/* Remember Me */}
            <Box className="mb-6">
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" className="!text-gray-700">
                    Remember me
                  </Typography>
                }
              />
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={!formik.isValid || loginMutation.isPending}
              loading={loginMutation.isPending}
              className="!mb-6 !py-3"
            >
              {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Additional Links */}
            <Box className="text-center">
              <Typography variant="body2">
                <MuiLink
                  component={Link}
                  to="/forgot-password"
                  className="!text-primary-600 hover:!text-primary-700 !font-medium"
                >
                  Forgot your password?
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box className="absolute bottom-4 left-0 right-0 text-center">
        <Typography variant="caption" className="!text-gray-500">
          © 2025 DCC-SFA. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
