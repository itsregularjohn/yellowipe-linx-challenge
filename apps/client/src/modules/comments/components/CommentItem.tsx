import type { FC } from "react";
import { useState } from "react";
import type { Comment } from "@yellowipe-linx/schemas";
import { useAuth } from "../../auth/contexts/AuthContext";
import { ReactionButton } from "../../reactions";

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => Promise<void>;
  onReply?: (parentCommentId: string) => void;
  level?: number;
}

export const CommentItem: FC<CommentItemProps> = ({
  comment,
  onDelete,
  onReply,
  level = 0,
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.userId;
  const marginLeft = level * 24; // Indent replies

  const handleDelete = async () => {
    if (!onDelete || !isOwner) return;

    // Show confirmation alert
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return diffMinutes === 0 ? "Now" : `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="flex space-x-3" style={{ marginLeft: `${marginLeft}px` }}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">
            {comment.user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-gray-900">
              {comment.user?.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 mt-2 ml-3">
          <ReactionButton commentId={comment.id} className="text-xs" />
          
          {/* Reply button */}
          {!comment.commentId && onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs font-medium text-gray-500 hover:text-blue-600"
            >
              Reply
            </button>
          )}

          {/* Delete button (only for comment owner) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-xs font-medium text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              disabled={isDeleting}
              title="Delete comment"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
