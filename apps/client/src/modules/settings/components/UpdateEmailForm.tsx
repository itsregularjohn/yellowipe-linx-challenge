import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UpdateEmailInput } from '@yellowipe/schemas';
import { updateEmailInputSchema } from '@yellowipe/schemas';
import { authApi } from '../../auth/services/auth';
import { useAuth } from '../../auth/contexts/AuthContext';

export const UpdateEmailForm: FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateEmailInput>({
    resolver: zodResolver(updateEmailInputSchema),
  });

  const onSubmit = async (data: UpdateEmailInput) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      await authApi.updateEmail(data);
      setSuccess('Email updated successfully! Please check your new email for verification.');
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
        Update Email Address
      </h3>
      <div className="mb-4">
        <span className="font-medium text-gray-900">Current Email: </span>
        <span className="text-gray-600">{user?.email}</span>
      </div>
      
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
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
            New Email Address
          </label>
          <input
            {...register('newEmail')}
            type="email"
            id="newEmail"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowipe-500 focus:border-yellowipe-500 sm:text-sm"
            placeholder="Enter new email address"
          />
          {errors.newEmail && (
            <p className="mt-2 text-sm text-red-600">{errors.newEmail.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </div>
      </form>
    </div>
  );
};