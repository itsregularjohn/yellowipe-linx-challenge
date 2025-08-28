import type { FC } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../auth/contexts/AuthContext';

export const HomePage: FC = () => {
  const { user } = useAuth();

  return (
    <Layout title="Home">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome, Yellowipe! 🟡
          </h2>
          <div className="text-sm text-gray-600">
            <p className="mb-2">Hello, {user?.name}!</p>
            <p className="mb-2">Email: {user?.email}</p>
            <p className="text-xs text-gray-500">
              User ID: {user?.id}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};