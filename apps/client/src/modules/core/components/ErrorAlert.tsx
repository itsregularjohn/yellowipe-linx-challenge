import type { FC } from 'react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
}

export const ErrorAlert: FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md relative">
      {error}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};