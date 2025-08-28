import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import type { VerifyEmailInput, SendVerificationEmailInput } from '@yellowipe/schemas';
import { verifyEmailInputSchema, sendVerificationEmailInputSchema } from '@yellowipe/schemas';
import { authApi } from '../services/auth';

export const VerifyEmailPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const code = searchParams.get('code') || '';
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailInputSchema),
    defaultValues: {
      code,
    },
  });

  const {
    register: registerResend,
    handleSubmit: handleSubmitResend,
    formState: { errors: resendErrors },
  } = useForm<SendVerificationEmailInput>({
    resolver: zodResolver(sendVerificationEmailInputSchema),
    defaultValues: {
      email,
    },
  });

  // Auto-verify if code is in URL
  useEffect(() => {
    if (code && !isSuccess && !error) {
      handleSubmit(onSubmit)();
    }
  }, [code]);

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await authApi.verifyEmail(data);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onResendSubmit = async (data: SendVerificationEmailInput) => {
    try {
      setResendMessage(null);
      setIsResending(true);
      await authApi.sendVerificationEmail(data);
      setResendMessage('Verification email sent successfully!');
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                Email Verified Successfully
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your email has been verified. You will be redirected to the login page shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the verification code sent to your email address.
            </p>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              {...register('code')}
              type="text"
              id="code"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellowipe-500 focus:border-yellowipe-500 focus:z-10 sm:text-sm"
              placeholder="Enter verification code"
            />
            {errors.code && (
              <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellowipe-600 hover:bg-yellowipe-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowipe-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 text-center mb-4">
              Didn't receive the email?
            </p>
            <form onSubmit={handleSubmitResend(onResendSubmit)}>
              {resendMessage && (
                <div className={`rounded-md p-4 mb-4 ${
                  resendMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <p className="text-sm">{resendMessage}</p>
                </div>
              )}
              <div>
                <label htmlFor="resendEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...registerResend('email')}
                  type="email"
                  id="resendEmail"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellowipe-500 focus:border-yellowipe-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                {resendErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{resendErrors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-yellowipe-300 text-sm font-medium rounded-md text-yellowipe-700 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:bg-gradient-to-br from-yellow-50 to-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowipe-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/auth"
              className="text-yellowipe-600 hover:text-yellowipe-500 font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};