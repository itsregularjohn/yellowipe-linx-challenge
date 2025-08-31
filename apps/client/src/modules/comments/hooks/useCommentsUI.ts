import { useState } from "react";

export function useCommentsUI() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const expandReplies = (commentId: string) => {
    setExpandedReplies((prev) => new Set([...prev, commentId]));
  };

  const collapseReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  };

  const toggleReplies = (commentId: string) => {
    if (expandedReplies.has(commentId)) {
      collapseReplies(commentId);
      return false; // collapsed
    } else {
      expandReplies(commentId);
      return true; // expanded
    }
  };

  return {
    replyingTo,
    expandedReplies,
    handleReply,
    expandReplies,
    collapseReplies,
    toggleReplies,
  };
}
