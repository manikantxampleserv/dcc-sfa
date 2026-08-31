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

import { Checkbox, FormControlLabel, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from 'shared/Button';
import Input from 'shared/Input';
import * as Yup from 'yup';
import { useAuth } from '../../../context/AuthContext';

/**
 * Validation schema for login form
 */
const loginValidationSchema = Yup.object({
  email: Yup.string().required('Email or User Code is required'),
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
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  /**
   * Check if user is already authenticated
   */
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
    // Store remember me preference
    if (values.rememberMe) {
      localStorage.setItem('dcc_b2b_remember_email', values.email);
    } else {
      localStorage.removeItem('dcc_b2b_remember_email');
    }

    setLoading(true);
    try {
      await login(values.email, values.password);
      // navigation is handled by login context
    } catch (e) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load remembered email on component mount
   */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('dcc_b2b_remember_email');
    if (rememberedEmail) {
      formik.setFieldValue('email', rememberedEmail);
      formik.setFieldValue('rememberMe', true);
    }
  }, []);

  const handleFillDemoData = (email: string) => {
    formik.setValues({
      email,
      password: 'password',
      rememberMe: formik.values.rememberMe,
    });
  };

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
            type="text"
            label="Username"
            placeholder="Enter your email or employee code"
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
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!formik.isValid || loading}
            loading={loading}
            className="!py-2 sm:!py-3 disabled:!text-gray-200 !text-sm sm:!text-base !font-semibold !rounded-lg !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !shadow-md hover:!shadow-lg !transition-all !duration-200"
          >
            {loading ? 'Signing In...' : 'Log In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-semibold text-blue-800 mb-2">
            Demo Credentials (Click to auto-fill):
          </p>
          <div className="text-xs space-y-1">
            <button
              type="button"
              onClick={() => handleFillDemoData('ahmed@stockist.co.tz')}
              className="w-full text-left p-2 rounded hover:bg-blue-100 transition-colors text-blue-700"
            >
              <strong>Customer:</strong> ahmed@stockist.co.tz / password
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoData('grace@bonite.co.tz')}
              className="w-full text-left p-2 rounded hover:bg-blue-100 transition-colors text-blue-700"
            >
              <strong>Sales Officer:</strong> grace@bonite.co.tz / password
            </button>
          </div>
        </div>

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
