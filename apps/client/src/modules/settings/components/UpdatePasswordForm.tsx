import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordInputSchema } from '@yellowipe-linx/schemas';
import { authApi } from '../../auth/services/auth';
import { z } from 'zod';

const clientUpdatePasswordSchema = updatePasswordInputSchema.extend({
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ClientUpdatePasswordInput = z.infer<typeof clientUpdatePasswordSchema>;

export const UpdatePasswordForm: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientUpdatePasswordInput>({
    resolver: zodResolver(clientUpdatePasswordSchema),
  });

  const onSubmit = async (data: ClientUpdatePasswordInput) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...updateData } = data;
      await authApi.updatePassword(updateData);
      setSuccess('Password updated successfully!');
      reset();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Update Password
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            {...register('currentPassword')}
            type="password"
            id="currentPassword"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowipe-linx-500 focus:border-yellowipe-linx-500 sm:text-sm"
            placeholder="Enter current password"
          />
          {errors.currentPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            {...register('newPassword')}
            type="password"
            id="newPassword"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowipe-linx-500 focus:border-yellowipe-linx-500 sm:text-sm"
            placeholder="Enter new password"
          />
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowipe-linx-500 focus:border-yellowipe-linx-500 sm:text-sm"
            placeholder="Confirm new password"
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
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};