import type { FC } from "react";
import { useState, useEffect } from "react";
import type { Post, PostsList } from "@yellowipe-linx/schemas";
import { postsApi } from "../services/posts";
import { PostCard } from "./PostCard";

interface PostsFeedProps {
  refreshTrigger?: number; // Used to refresh the feed when a new post is created
}

export const PostsFeed: FC<PostsFeedProps> = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const response: PostsList = await postsApi.getPosts(pageNum, 10);

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...response.posts]);
      } else {
        setPosts(response.posts);
      }

      setHasMore(pageNum * 10 < response.pagination.total);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPosts(1, false);
    setPage(1);
  }, [refreshTrigger]);

  // Load more posts
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await postsApi.deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error; // Re-throw to let PostCard handle the error display
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="ml-3 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p>{error}</p>
        </div>
        <button
          onClick={() => loadPosts(1, false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
            />
          </svg>
          <p className="text-xl font-medium mb-2">No posts yet</p>
          <p className="text-gray-400">Be the first to share something!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Posts List */}
      <div className="space-y-0">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`px-6 py-3 rounded-lg font-medium ${
              isLoadingMore
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            }`}
          >
            {isLoadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
