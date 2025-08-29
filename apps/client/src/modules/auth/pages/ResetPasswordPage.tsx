import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordInputSchema } from '@yellowipe/schemas';
import { authApi } from '../services/auth';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const clientResetPasswordSchema = resetPasswordInputSchema.extend({
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ClientResetPasswordInput = z.infer<typeof clientResetPasswordSchema>;

export const ResetPasswordPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const code = searchParams.get('code') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientResetPasswordInput>({
    resolver: zodResolver(clientResetPasswordSchema),
    defaultValues: {
      code,
    },
  });

  const onSubmit = async (data: ClientResetPasswordInput) => {
    try {
      setError(null);
      setIsLoading(true);
      const { confirmPassword, ...resetData } = data;
      await authApi.resetPassword(resetData);
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                Password Reset Successful
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your password has been reset successfully. You will be redirected to the login page shortly.
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
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <input type="hidden" {...register('code')} />
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              {...register('newPassword')}
              type="password"
              id="newPassword"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellowipe-500 focus:border-yellowipe-500 focus:z-10 sm:text-sm"
              placeholder="Enter your new password"
            />
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellowipe-500 focus:border-yellowipe-500 focus:z-10 sm:text-sm"
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          <div className="text-center">
            <Link
              to="/auth"
              className="text-yellowipe-600 hover:text-yellowipe-500 font-medium"
            >
              Back to login
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};