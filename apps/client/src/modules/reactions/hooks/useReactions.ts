import { useState, useCallback } from "react";
import type { Reaction, ReactionType, CreateReactionInput } from "@yellowipe-linx/schemas";
import { reactionsApi } from "../services";
import { useAuth } from "../../auth/contexts/AuthContext";

interface UseReactionsProps {
  postId?: string;
  commentId?: string;
}

export function useReactions({ postId, commentId }: UseReactionsProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadReactions = useCallback(async () => {
    if (!postId && !commentId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = postId 
        ? await reactionsApi.getPostReactions(postId)
        : await reactionsApi.getCommentReactions(commentId!);
        
      setReactions(response.reactions);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Failed to load reactions:", error);
      setError("Failed to load reactions");
    } finally {
      setLoading(false);
    }
  }, [postId, commentId]);

  const addReaction = async (type: ReactionType) => {
    if (!user || (!postId && !commentId)) return;

    try {
      const input: CreateReactionInput = {
        type,
        postId: postId || undefined,
        commentId: commentId || undefined,
      };

      const newReaction = await reactionsApi.createReaction(input);
      
      // Remove any existing reaction from this user and add the new one
      setReactions((prev) => [
        ...prev.filter((r) => r.userId !== user.id),
        newReaction,
      ]);
    } catch (error) {
      console.error("Failed to add reaction:", error);
      throw error;
    }
  };

  const removeReaction = async () => {
    if (!user) return;

    try {
      // Delete user's reaction
      if (postId) {
        await reactionsApi.deletePostReaction(postId);
      } else if (commentId) {
        await reactionsApi.deleteCommentReaction(commentId);
      }

      // Remove from local state
      setReactions((prev) => prev.filter((r) => r.userId !== user.id));
    } catch (error) {
      console.error("Failed to remove reaction:", error);
      throw error;
    }
  };

  const getUserReaction = (): Reaction | undefined => {
    if (!user) return undefined;
    return reactions.find((r) => r.userId === user.id);
  };

  const getReactionCounts = () => {
    const counts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      laugh: 0,
      angry: 0,
      sad: 0,
    };

    reactions.forEach((reaction) => {
      counts[reaction.type]++;
    });

    return counts;
  };

  const getTotalCount = () => reactions.length;

  return {
    reactions,
    loading,
    error,
    hasLoadedOnce,
    loadReactions,
    addReaction,
    removeReaction,
    getUserReaction,
    getReactionCounts,
    getTotalCount,
  };
}