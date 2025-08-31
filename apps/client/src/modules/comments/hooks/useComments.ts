import { useState, useCallback } from "react";
import type { Comment, CreateCommentInput } from "@yellowipe-linx/schemas";
import { commentsApi } from "../services/comments";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsApi.getPostComments(postId);
      setComments(response.comments);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadReplies = async (commentId: string) => {
    try {
      const response = await commentsApi.getCommentReplies(commentId);
      setReplies((prev) => ({
        ...prev,
        [commentId]: response.comments,
      }));
    } catch (error) {
      console.error("Failed to load replies:", error);
      throw error;
    }
  };

  const createComment = async (input: CreateCommentInput) => {
    try {
      const newComment = await commentsApi.createComment(input);
      
      if (input.postId) {
        setComments((prev) => [...prev, newComment]);
        setHasLoadedOnce(true);
      } else if (input.commentId) {
        setReplies((prev) => ({
          ...prev,
          [input.commentId!]: [...(prev[input.commentId!] || []), newComment],
        }));
        
        setComments((prev) => prev.map((comment) => 
          comment.id === input.commentId 
            ? { 
                ...comment, 
                _count: { 
                  replies: (comment._count?.replies || 0) + 1 
                } 
              }
            : comment
        ));
      }
      
      return newComment;
    } catch (error) {
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await commentsApi.deleteComment(commentId);
      
      // Find parent comment if this is a reply
      let parentCommentId: string | null = null;
      for (const [parentId, repliesList] of Object.entries(replies)) {
        if (repliesList.some(reply => reply.id === commentId)) {
          parentCommentId = parentId;
          break;
        }
      }
      
      // Remove from main comments
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      
      // Remove from replies
      setReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].filter((c) => c.id !== commentId);
        });
        return updated;
      });
      
      // Update parent comment's reply count if this was a reply
      if (parentCommentId) {
        setComments((prev) => prev.map((comment) => 
          comment.id === parentCommentId 
            ? { 
                ...comment, 
                _count: { 
                  replies: Math.max((comment._count?.replies || 0) - 1, 0) 
                } 
              }
            : comment
        ));
      }
    } catch (error) {
      throw error;
    }
  };

  const getReplyCount = (comment: Comment) => {
    const loadedCount = replies[comment.id]?.length || 0;
    const backendCount = comment._count?.replies ?? 0;
    return loadedCount > 0 ? loadedCount : backendCount;
  };

  const getTopLevelCommentsCount = () => {
    return comments.length;
  };

  return {
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
  };
}