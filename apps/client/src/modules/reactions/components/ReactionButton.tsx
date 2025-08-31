import type { FC } from "react";
import { useState, useEffect } from "react";
import type { ReactionType } from "@yellowipe-linx/schemas";
import { useReactions } from "../hooks";

interface ReactionButtonProps {
  postId?: string;
  commentId?: string;
  className?: string;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  angry: "😠",
  sad: "😢",
};

const REACTION_LABELS: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  laugh: "Laugh",
  angry: "Angry",
  sad: "Sad",
};

export const ReactionButton: FC<ReactionButtonProps> = ({
  postId,
  commentId,
  className = "",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const {
    loadReactions,
    addReaction,
    removeReaction,
    getUserReaction,
    getTotalCount,
    getReactionCounts,
    hasLoadedOnce,
  } = useReactions({ postId, commentId });

  useEffect(() => {
    if (!hasLoadedOnce) {
      loadReactions();
    }
  }, [loadReactions, hasLoadedOnce]);

  const userReaction = getUserReaction();
  const totalCount = getTotalCount();
  const reactionCounts = getReactionCounts();

  const handleReactionClick = async (type: ReactionType) => {
    try {
      if (userReaction?.type === type) {
        // Remove reaction if clicking the same type
        await removeReaction();
      } else {
        // Add or change reaction
        await addReaction(type);
      }
      setShowPicker(false);
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const handleMainButtonClick = () => {
    if (userReaction) {
      // If user has reacted, remove their reaction
      removeReaction().catch(console.error);
    } else {
      // Show picker for new reaction
      setShowPicker(!showPicker);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main reaction button */}
      <button
        onClick={handleMainButtonClick}
        className={`flex items-center space-x-1 hover:text-yellow-600 transition-colors ${
          userReaction ? "text-yellow-600" : "text-gray-500"
        }`}
      >
        {userReaction ? (
          <>
            <span className="text-lg">{REACTION_EMOJIS[userReaction.type]}</span>
            <span className="text-sm font-medium">
              {REACTION_LABELS[userReaction.type]}
            </span>
          </>
        ) : (
          <>
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
          </>
        )}
        {totalCount > 0 && (
          <span className="text-sm text-gray-400">({totalCount})</span>
        )}
      </button>

      {/* Reaction picker */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker popup */}
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
            <div className="flex space-x-1">
              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                <button
                  key={type}
                  onClick={() => handleReactionClick(type as ReactionType)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg ${
                    userReaction?.type === type ? "bg-yellow-100" : ""
                  }`}
                  title={`${REACTION_LABELS[type as ReactionType]} ${
                    reactionCounts[type as ReactionType] > 0
                      ? `(${reactionCounts[type as ReactionType]})`
                      : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};