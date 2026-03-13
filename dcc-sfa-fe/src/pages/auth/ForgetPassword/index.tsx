import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Dialog, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useForgotPassword,
  useResetPassword,
  useVerifyResetOtp,
} from 'hooks/useAuth';
import React, { useEffect, useRef, useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import * as Yup from 'yup';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

const ForgetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  defaultEmail,
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');
  const [resetToken, setResetToken] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => '')
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const forgotPasswordMutation = useForgotPassword({
    onSuccess: () => {
      setStep('otp');
    },
  });

  const verifyOtpMutation = useVerifyResetOtp({
    onSuccess: data => {
      const tokenFromResponse =
        (data?.data && (data.data.resetToken || data.data.token)) ||
        data?.resetToken ||
        '';
      setResetToken(tokenFromResponse);
      if (tokenFromResponse) {
        setStep('reset');
      }
    },
  });

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setStep('done');
    },
  });

  const forgotFormik = useFormik<{ email: string }>({
    initialValues: {
      email: defaultEmail || '',
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
      otp: Yup.string()
        .required('OTP is required')
        .length(6, 'Enter 6 digit code'),
    }),
    onSubmit: values => {
      verifyOtpMutation.mutate({
        email: forgotFormik.values.email,
        otp: values.otp,
      });
    },
  });

  const resetFormik = useFormik<{
    newPassword: string;
    confirmPassword: string;
  }>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, 'Minimum 6 characters')
        .required('New password is required'),
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

  useEffect(() => {
    if (!open) return;
    setStep('email');
    setResetToken('');
    setOtpDigits(Array.from({ length: 6 }, () => ''));
    forgotFormik.resetForm({ values: { email: defaultEmail || '' } });
    otpFormik.resetForm({ values: { otp: '' } });
    resetFormik.resetForm({ values: { newPassword: '', confirmPassword: '' } });
  }, [open, defaultEmail]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: '!w-full !max-w-[500px] !rounded-xl !p-6',
        },
      }}
    >
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="mb-6 bg-yellow-50 p-4 rounded-full border border-yellow-100 flex items-center justify-center">
          <LockOutlinedIcon className="!text-yellow-500 !text-5xl" />
        </div>

        {/* Title & Description */}
        <div className="text-center mb-8">
          <Typography variant="h5" className="!font-bold !text-gray-900 !mb-2">
            {step === 'email' ? 'Trouble Logging In?' : 'Reset Password'}
          </Typography>
          <Typography
            variant="body2"
            className="!text-gray-600 !mx-auto !leading-relaxed"
          >
            {step === 'email'
              ? "Enter your email and we'll send you a link to get back into your account."
              : 'Recover access to your account in a few steps.'}
          </Typography>
        </div>

        {/* Progress Steps */}
        {step !== 'done' && (
          <div className="flex items-center gap-0.5 mb-8 w-full justify-center">
            {[
              { key: 'email', label: 'Email' },
              { key: 'otp', label: 'Verify' },
              { key: 'reset', label: 'Reset' },
            ].map((item, index) => {
              const isActive = step === item.key;
              const isDone =
                (item.key === 'email' && step !== 'email') ||
                (item.key === 'otp' && step === 'reset');

              return (
                <React.Fragment key={item.key}>
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-100'
                        : isDone
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {item.label}
                  </div>
                  {index < 2 && <div className="h-[1px] w-5 bg-gray-200" />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        <div className="w-full mb-8">
          {step === 'email' && (
            <form
              onSubmit={e => {
                e.preventDefault();
                forgotFormik.handleSubmit();
              }}
              className="w-full max-w-[400px] mx-auto"
            >
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                formik={forgotFormik}
                required
              />
            </form>
          )}

          {step === 'otp' && (
            <div className="w-full  mx-auto">
              <Typography
                variant="body2"
                className="!text-gray-600  !mb-4 !text-center"
              >
                Enter the 6-digit code sent to {forgotFormik.values.email}.
              </Typography>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  otpFormik.handleSubmit();
                }}
              >
                <div className="flex justify-center gap-2 mb-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => {
                        otpRefs.current[index] = el;
                      }}
                      value={digit}
                      inputMode="numeric"
                      maxLength={1}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        const nextDigits = [...otpDigits];
                        if (!value) {
                          nextDigits[index] = '';
                          setOtpDigits(nextDigits);
                          otpFormik.setFieldValue('otp', nextDigits.join(''));
                          return;
                        }
                        nextDigits[index] = value[value.length - 1];
                        setOtpDigits(nextDigits);
                        otpFormik.setFieldValue('otp', nextDigits.join(''));
                        if (index < 5) {
                          otpRefs.current[index + 1]?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (
                          e.key === 'Backspace' &&
                          !otpDigits[index] &&
                          index > 0
                        ) {
                          otpRefs.current[index - 1]?.focus();
                        }
                      }}
                      className="w-10 h-10 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ))}
                </div>
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <Typography
                    variant="caption"
                    className="!text-red-500 !text-center !block"
                  >
                    {otpFormik.errors.otp}
                  </Typography>
                )}
              </form>
            </div>
          )}

          {step === 'reset' && (
            <form
              onSubmit={e => {
                e.preventDefault();
                resetFormik.handleSubmit();
              }}
              className="w-full flex flex-col max-w-[320px] mx-auto space-y-4 gap-3"
            >
              <Input
                name="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                formik={resetFormik}
                required
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Re-enter new password"
                formik={resetFormik}
                required
              />
            </form>
          )}

          {step === 'done' && (
            <div className="text-center bg-green-50 p-4 rounded-lg border border-green-100">
              <Typography
                variant="body2"
                className="!text-green-700 !font-medium"
              >
                Password reset successful. You can now sign in with your new
                password.
              </Typography>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full justify-center">
          <Button
            variant="outlined"
            onClick={onClose}
            className="!capitalize !min-w-[140px] !py-2.5 !rounded-lg !border-gray-300 !text-gray-700 hover:!bg-gray-50"
          >
            Close
          </Button>
          {step !== 'done' && (
            <Button
              loading={
                (step === 'email'
                  ? forgotPasswordMutation.isPending
                  : step === 'otp'
                    ? verifyOtpMutation.isPending
                    : resetPasswordMutation.isPending) as any
              }
              variant="contained"
              onClick={() => {
                if (step === 'email') forgotFormik.handleSubmit();
                else if (step === 'otp') otpFormik.handleSubmit();
                else if (step === 'reset') resetFormik.handleSubmit();
              }}
              disabled={
                step === 'email'
                  ? !forgotFormik.isValid || !forgotFormik.values.email
                  : step === 'otp'
                    ? !otpFormik.isValid || !otpFormik.values.otp
                    : !resetFormik.isValid ||
                      !resetFormik.values.newPassword ||
                      !resetToken
              }
              className="!capitalize disabled:!text-gray-300 !min-w-[140px] !py-2.5 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !shadow-none"
            >
              {step === 'email'
                ? 'Send'
                : step === 'otp'
                  ? 'Verify'
                  : 'Reset Password'}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ForgetPasswordModal;
