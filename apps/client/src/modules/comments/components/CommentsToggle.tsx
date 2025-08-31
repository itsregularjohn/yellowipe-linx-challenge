import type { FC } from "react";

interface CommentsToggleProps {
  isExpanded: boolean;
  totalComments: number;
  loading: boolean;
  hasLoadedOnce: boolean;
  onToggle: () => void;
}

export const CommentsToggle: FC<CommentsToggleProps> = ({
  isExpanded,
  totalComments,
  loading,
  hasLoadedOnce,
  onToggle,
}) => {
  const getToggleText = () => {
    if (!hasLoadedOnce) {
      return "Comments";
    }

    if (loading && !isExpanded) {
      return "Loading...";
    }

    if (totalComments > 0) {
      return `${totalComments} comment${totalComments !== 1 ? "s" : ""}`;
    }

    return "No comments yet";
  };

  return (
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
    >
      <span>{getToggleText()}</span>
      <svg
        className={`w-4 h-4 transform transition-transform ${
          isExpanded ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};
