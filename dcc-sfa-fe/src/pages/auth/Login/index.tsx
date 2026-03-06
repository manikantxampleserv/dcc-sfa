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
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import {
  useForgotPassword,
  useLogin,
  useResetPassword,
  useVerifyResetOtp,
} from 'hooks/useAuth';
import { userQueryKeys } from 'hooks/useUsers';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type LoginRequest } from 'services/auth/authService';
import tokenService from 'services/auth/tokenService';
import Button from 'shared/Button';
import Input from 'shared/Input';
import * as Yup from 'yup';

/**
 * Validation schema for login form
 */
const loginValidationSchema = Yup.object({
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    )
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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');
  const [resetToken, setResetToken] = useState('');

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  // Login mutation with React Query
  const loginMutation = useLogin({
    onSuccess: response => {
      if (response.success) {
        // Trigger auth change event (tokenService already does this, but ensure it happens)
        window.dispatchEvent(new Event('auth-change'));
        // Invalidate user profile query to trigger refetch
        queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
        // Small delay to ensure token is set before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      }
    },
  });

  const forgotPasswordMutation = useForgotPassword({
    onSuccess: () => {
      setForgotStep('otp');
    },
  });

  const verifyOtpMutation = useVerifyResetOtp({
    onSuccess: (data, variables) => {
      const tokenFromResponse =
        (data?.data && (data.data.resetToken || data.data.token)) ||
        data?.resetToken ||
        '';
      setResetToken(tokenFromResponse);
      // Fallback: if backend doesn't send token, stay on otp step
      if (tokenFromResponse) {
        setForgotStep('reset');
      }
    },
  });

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setForgotStep('done');
    },
  });

  const forgotFormik = useFormik<{ email: string }>({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          'Please enter a valid email address'
        )
        .required('Email is required'),
    }),
    onSubmit: values => {
      forgotPasswordMutation.mutate(values.email);
    },
  });

  const otpFormik = useFormik<{ otp: string }>({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string().required('OTP is required').length(6, 'Enter 6 digit code'),
    }),
    onSubmit: values => {
      verifyOtpMutation.mutate({ email: forgotFormik.values.email, otp: values.otp });
    },
  });

  const resetFormik = useFormik<{ newPassword: string; confirmPassword: string }>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().min(6, 'Minimum 6 characters').required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: values => {
      resetPasswordMutation.mutate({
        resetToken,
        newPassword: values.newPassword,
      });
    },
  });

  /**
   * Check if user is already authenticated
   */
  useEffect(() => {
    if (tokenService.isAuthenticated()) {
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
    console.log(values);

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
      forgotFormik.setFieldValue('email', rememberedEmail);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Right Section - Dashboard Preview */}
      <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
        <div className="bg-gradient-to-br min-h-[400px] lg:h-full rounded-lg from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">
              Streamline your sales force operations.
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Access your SFA dashboard to manage orders, customers, and field
              operations.
            </p>
          </div>

          {/* Dashboard Preview Card */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl py-4 sm:py-6 lg:py-6 px-4 sm:px-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Orders
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  1,247
                </div>
                <div className="text-xs text-green-600">+15.2%</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Active Customers
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  856
                </div>
                <div className="text-xs text-green-600">+8.7%</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Field Visits
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  324
                </div>
                <div className="text-xs text-orange-600">This Week</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                Product Categories
              </div>
              <div className="flex items-center justify-center h-20 sm:h-24 bg-white rounded-lg">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-blue-600 mb-1">
                    2,847 Units
                  </div>
                  <div className="text-xs text-gray-600 px-2">
                    Beverages: 35% | Snacks: 28% | Dairy: 22% | Others: 15%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                Recent Orders
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white rounded p-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">B</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                        Coca-Cola 500ml Pack
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Order #ORD-2024-001
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                      TZS 245.50
                    </div>
                    <div className="text-xs text-green-600">Delivered</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white rounded p-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 text-lg font-bold">
                        S
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                        Snack Mix Variety Pack
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Order #ORD-2024-002
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                      TZS 189.75
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
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-32 py-6 sm:py-8 lg:py-12">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">D</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              DCC-SFA
            </span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Enter your email and password to access your account.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="space-y-4 sm:space-y-6"
        >
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
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
                <span className="text-gray-700 text-xs sm:text-sm font-medium">
                  Remember Me
                </span>
              }
            />
            <MuiLink
              onClick={() => {
                setForgotStep('email');
                setResetToken('');
                setForgotOpen(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-xs lg:!text-sm font-medium no-underline hover:underline transition-colors"
            >
              Forgot your password?
            </MuiLink>
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!formik.isValid || loginMutation.isPending}
            loading={loginMutation.isPending}
            className="!py-2 sm:!py-3 disabled:!text-gray-200 !text-sm sm:!text-base !font-semibold !rounded-lg !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !shadow-md hover:!shadow-lg !transition-all !duration-200"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Log In'}
          </Button>
        </form>

        <Dialog
          open={forgotOpen}
          onClose={() => setForgotOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle className="!font-bold !text-gray-900">
            Reset Password
          </DialogTitle>
          <DialogContent>
            {forgotStep === 'email' && (
              <div className="space-y-4 pt-1">
                <Typography variant="body2" className="!text-gray-600">
                  Enter your account email and we will send you a reset link.
                </Typography>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    forgotFormik.handleSubmit();
                  }}
                >
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    formik={forgotFormik}
                    required
                    className="!mt-2"
                  />
                </form>
              </div>
            )}
            {forgotStep === 'otp' && (
              <div className="space-y-4 pt-1">
                <Typography variant="body2" className="!text-gray-600">
                  Enter the 6-digit code sent to {forgotFormik.values.email}.
                </Typography>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    otpFormik.handleSubmit();
                  }}
                >
                  <Input
                    name="otp"
                    type="text"
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    formik={otpFormik}
                    required
                  />
                </form>
              </div>
            )}
            {forgotStep === 'reset' && (
              <div className="space-y-4 pt-1">
                <Typography variant="body2" className="!text-gray-600">
                  Create a new password for {forgotFormik.values.email}.
                </Typography>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    resetFormik.handleSubmit();
                  }}
                >
                  <Input
                    name="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="Enter new password"
                    formik={resetFormik}
                    required
                  />
                  <div className="!mt-3" />
                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    formik={resetFormik}
                    required
                  />
                </form>
              </div>
            )}
            {forgotStep === 'done' && (
              <div className="py-1">
                <Typography variant="body2" className="!text-green-700">
                  Password reset successful. You can now sign in with your new password.
                </Typography>
              </div>
            )}
          </DialogContent>
          <DialogActions className="!px-6 !pb-4 !gap-2">
            <Button
              variant="outlined"
              onClick={() => setForgotOpen(false)}
              className="!capitalize"
            >
              Close
            </Button>
            {forgotStep === 'email' && (
              <Button
                loading={forgotPasswordMutation.isPending as any}
                variant="contained"
                onClick={() => forgotFormik.handleSubmit()}
                disabled={!forgotFormik.isValid || !forgotFormik.values.email}
                className="!capitalize"
              >
                Send Reset Link
              </Button>
            )}
            {forgotStep === 'otp' && (
              <Button
                loading={verifyOtpMutation.isPending as any}
                variant="contained"
                onClick={() => otpFormik.handleSubmit()}
                disabled={!otpFormik.isValid || !otpFormik.values.otp}
                className="!capitalize"
              >
                Verify Code
              </Button>
            )}
            {forgotStep === 'reset' && (
              <Button
                loading={resetPasswordMutation.isPending as any}
                variant="contained"
                onClick={() => resetFormik.handleSubmit()}
                disabled={
                  !resetFormik.isValid ||
                  !resetFormik.values.newPassword ||
                  !resetFormik.values.confirmPassword ||
                  !resetToken
                }
                className="!capitalize"
              >
                Reset Password
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-8 sm:mt-12 text-xs text-gray-500">
          <span className="text-center sm:text-left">
            Copyright © {new Date().getFullYear()} DCC Sales Force Automation
            System.
          </span>
          <MuiLink
            component={Link}
            to="/privacy-policy"
            className="text-gray-500 hover:text-gray-700 no-underline hover:underline transition-colors text-center sm:text-right"
          >
            Privacy Policy
          </MuiLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
