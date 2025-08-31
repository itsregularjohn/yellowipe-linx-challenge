import type { FC } from "react";
import { useState, useEffect } from "react";
import type { CreateCommentInput } from "@yellowipe-linx/schemas";
import { CommentInput } from "./CommentInput";
import { CommentsToggle } from "./CommentsToggle";
import { CommentsList } from "./CommentsList";
import { useComments } from "../hooks/useComments";

interface CommentsSectionProps {
  postId: string;
  initialCommentsCount?: number;
}

export const CommentsSection: FC<CommentsSectionProps> = ({ postId }) => {
  const [showComments, setShowComments] = useState(false);

  const {
    comments,
    replies,
    loading,
    error,
    hasLoadedOnce,
    loadComments,
    loadReplies,
    createComment,
    deleteComment,
    getReplyCount,
    getTopLevelCommentsCount,
  } = useComments(postId);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments, comments.length, loadComments]);

  const handleCreateComment = async (input: CreateCommentInput) => {
    await createComment(input);
  };

  return (
    <div className="border-t border-gray-200">
      <CommentsToggle
        isExpanded={showComments}
        totalComments={getTopLevelCommentsCount()}
        loading={loading}
        hasLoadedOnce={hasLoadedOnce}
        onToggle={() => setShowComments(!showComments)}
      />

      {showComments && (
        <div className="px-4 pb-4">
          <div className="mb-4">
            <CommentInput
              postId={postId}
              onSubmit={handleCreateComment}
              placeholder="Write a comment..."
            />
          </div>

          <CommentsList
            comments={comments}
            replies={replies}
            loading={loading}
            error={error}
            onCreateComment={handleCreateComment}
            onDeleteComment={deleteComment}
            onLoadReplies={loadReplies}
            onRetry={loadComments}
            getReplyCount={getReplyCount}
          />
        </div>
      )}
    </div>
  );
};
