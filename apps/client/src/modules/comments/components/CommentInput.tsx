import type { FC } from "react";
import { useState } from "react";
import type { CreateCommentInput } from "@yellowipe-linx/schemas";
import { useAuth } from "../../auth/contexts/AuthContext";

interface CommentInputProps {
  postId?: string;
  commentId?: string;
  onSubmit: (input: CreateCommentInput) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommentInput: FC<CommentInputProps> = ({
  postId,
  commentId,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    const input: CreateCommentInput = {
      content: content.trim(),
      postId,
      commentId,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(input);
      setContent("");
      onCancel?.();
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("Failed to create comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  if (!user) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Please log in to comment
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="flex-1">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            rows={1}
            style={{
              minHeight: "36px",
              maxHeight: "120px",
              height: "auto",
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            Press Enter to post, Shift+Enter for new line
          </div>
          <div className="flex space-x-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="px-4 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
