import type { FC } from 'react';
import { useState } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../auth/contexts/AuthContext';
import { PostTextarea, PostsFeed } from '../../posts/components';
import { postsApi } from '../../posts/services/posts';
import type { CreatePostInput } from '@yellowipe/schemas';

export const HomePage: FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostSubmit = async (postData: CreatePostInput) => {
    await postsApi.createPost(postData);
  };

  const handlePostCreated = () => {
    // Trigger refresh of the posts feed
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout title="Home">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Section */}
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

        {/* Post Creation */}
        <PostTextarea 
          onSubmit={handlePostSubmit}
          onPostCreated={handlePostCreated}
        />

        {/* Posts Feed */}
        <PostsFeed refreshTrigger={refreshTrigger} />
      </div>
    </Layout>
  );
};