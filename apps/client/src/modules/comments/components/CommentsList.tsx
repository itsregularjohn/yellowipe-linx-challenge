import type { FC } from "react";
import type { Comment, CreateCommentInput } from "@yellowipe-linx/schemas";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { useCommentsUI } from "../hooks/useCommentsUI";

interface CommentsListProps {
  comments: Comment[];
  replies: Record<string, Comment[]>;
  loading: boolean;
  error: string | null;
  onCreateComment: (input: CreateCommentInput) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLoadReplies: (commentId: string) => Promise<void>;
  onRetry: () => void;
  getReplyCount: (comment: Comment) => number;
}

export const CommentsList: FC<CommentsListProps> = ({
  comments,
  replies,
  loading,
  error,
  onCreateComment,
  onDeleteComment,
  onLoadReplies,
  onRetry,
  getReplyCount,
}) => {
  const {
    replyingTo,
    expandedReplies,
    handleReply,
    toggleReplies,
  } = useCommentsUI();

  const handleShowReplies = async (commentId: string) => {
    const wasExpanded = toggleReplies(commentId);
    if (wasExpanded) {
      await onLoadReplies(commentId);
    }
  };
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-red-500">{error}</div>
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:text-blue-800 mt-1"
        >
          Try again
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            onDelete={onDeleteComment}
            onReply={handleReply}
          />

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-2 ml-11">
              <CommentInput
                commentId={comment.id}
                onSubmit={onCreateComment}
                onCancel={() => handleReply(comment.id)}
                placeholder={`Reply to ${comment.user?.name}...`}
                autoFocus
              />
            </div>
          )}

          {/* Show Replies Button */}
          {!expandedReplies.has(comment.id) && getReplyCount(comment) > 0 && (
            <div className="mt-2 ml-11">
              <button
                onClick={() => handleShowReplies(comment.id)}
                className="text-xs font-medium text-gray-500 hover:text-blue-600"
              >
                View {getReplyCount(comment)} repl{getReplyCount(comment) === 1 ? 'y' : 'ies'}
              </button>
            </div>
          )}

          {/* Replies List */}
          {expandedReplies.has(comment.id) && replies[comment.id] && (
            <div className="mt-3 space-y-3">
              {replies[comment.id].map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onDelete={onDeleteComment}
                  level={1}
                />
              ))}
              
              {/* Hide Replies Button */}
              {getReplyCount(comment) > 0 && (
                <div className="ml-11">
                  <button
                    onClick={() => handleShowReplies(comment.id)}
                    className="text-xs font-medium text-gray-500 hover:text-blue-600"
                  >
                    Hide replies
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};