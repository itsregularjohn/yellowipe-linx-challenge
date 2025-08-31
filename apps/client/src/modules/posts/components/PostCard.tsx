import type { FC } from "react";
import { useState } from "react";
import type { Post } from "@yellowipe-linx/schemas";
import { useAuth } from "../../auth/contexts/AuthContext";
import { CommentsSection } from "../../comments";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => Promise<void>;
}

export const PostCard: FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === post.userId;

  const handleDelete = async () => {
    if (!onDelete || !isOwner) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{post.user?.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Delete Button (only for post owner) */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-400 hover:text-gray-600 p-1"
                disabled={isDeleting}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Delete Confirmation Dropdown */}
              {showDeleteConfirm && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <p className="text-sm text-gray-700 mb-2">
                    Delete this post?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.upload && (
        <div className="px-4 pb-2">
          <img
            src={post.upload.publicUrl}
            alt="Post attachment"
            className="w-full max-h-96 object-contain rounded-lg border"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-6 text-gray-500">
          {/* React Button - Placeholder for future functionality */}
          <button className="flex items-center space-x-1 hover:text-yellow-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">React</span>
          </button>

        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection postId={post.id} />

      {/* Click outside to close delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
