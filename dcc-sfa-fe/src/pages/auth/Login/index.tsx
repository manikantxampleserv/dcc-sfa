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

import {
  Alert,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useLogin } from 'hooks/useAuth';
import { userQueryKeys } from 'hooks/useUsers';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService, { type LoginRequest } from 'services/auth/authService';
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
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  // Login mutation with React Query
  const loginMutation = useLogin({
    onSuccess: response => {
      if (response.success) {
        setError(null);
        // Trigger auth change event (tokenService already does this, but ensure it happens)
        window.dispatchEvent(new Event('auth-change'));
        // Invalidate user profile query to trigger refetch
        queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
        // Small delay to ensure token is set before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
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
    <div className="min-h-screen flex lg:flex-row flex-col items-center">
      {/* Right Section - Dashboard Preview */}
      <div className="bg-white h-full w-1/2 p-6">
        <div className="bg-gradient-to-br h-full rounded-lg from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-center items-center p-10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Streamline your sales force operations.
            </h2>
            <p className="text-blue-100 text-base">
              Access your SFA dashboard to manage orders, customers, and field
              operations.
            </p>
          </div>

          {/* Dashboard Preview Card */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl py-8 px-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Orders</div>
                <div className="text-xl font-bold text-gray-900">1,247</div>
                <div className="text-xs text-green-600">+15.2%</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">
                  Active Customers
                </div>
                <div className="text-xl font-bold text-gray-900">856</div>
                <div className="text-xs text-green-600">+8.7%</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Field Visits</div>
                <div className="text-xl font-bold text-gray-900">324</div>
                <div className="text-xs text-orange-600">This Week</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">
                Product Categories
              </div>
              <div className="flex items-center justify-center h-24 bg-white rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600 mb-1">
                    2,847 Units
                  </div>
                  <div className="text-xs text-gray-600">
                    Beverages: 35% | Snacks: 28% | Dairy: 22% | Others: 15%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-50 rounded-lg py-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">
                Recent Orders
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white rounded p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">B</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Coca-Cola 500ml Pack
                      </div>
                      <div className="text-xs text-gray-500">
                        Order #ORD-2024-001
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-sm">
                      $245.50
                    </div>
                    <div className="text-xs text-green-600">Delivered</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white rounded p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">
                        S
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Snack Mix Variety Pack
                      </div>
                      <div className="text-xs text-gray-500">
                        Order #ORD-2024-002
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-sm">
                      $189.75
                    </div>
                    <div className="text-xs text-blue-600">Processing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Left Section - Login Form */}
      <div className="w-1/2 lg:px-32 bg-white flex flex-col justify-center py-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">DCC-SFA</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-base">
            Enter your email and password to access your account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-6 rounded-lg">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            formik={formik}
            required
            className="!mt-4"
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            formik={formik}
            required
            className="!mt-6"
          />

          <div className="flex items-center justify-between">
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  size="small"
                  sx={{
                    color: '#6b7280',
                    '&.Mui-checked': {
                      color: '#3b82f6',
                    },
                  }}
                />
              }
              label={
                <span className="text-gray-700 text-sm font-medium">
                  Remember Me
                </span>
              }
            />
            <MuiLink
              component={Link}
              to="#"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium no-underline hover:underline transition-colors"
            >
              Forgot Your Password?
            </MuiLink>
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!formik.isValid || loginMutation.isPending}
            loading={loginMutation.isPending}
            className="!py-3 !text-base !font-semibold !rounded-lg !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !shadow-md hover:!shadow-lg !transition-all !duration-200"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Log In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center mt-12 text-xs text-gray-500">
          <span>Copyright © 2025 DCC Sales Force Automation System.</span>
          <MuiLink
            component={Link}
            to="#"
            className="text-gray-500 hover:text-gray-700 no-underline hover:underline transition-colors"
          >
            Privacy Policy
          </MuiLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
