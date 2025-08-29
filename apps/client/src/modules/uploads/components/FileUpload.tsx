import type { FC, ChangeEvent } from 'react';
import { useState } from 'react';
import { uploadsApi, type Upload } from '../services/uploads';

interface FileUploadProps {
  onUploadSuccess?: (upload: Upload) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.(new Error('Only image files are supported (JPEG, PNG, WebP, GIF)'));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onUploadError?.(new Error('File size must be less than 10MB'));
      return;
    }

    setIsUploading(true);
    try {
      const upload = await uploadsApi.uploadFile(file);
      onUploadSuccess?.(upload);
      // Clear the input
      event.target.value = '';
    } catch (error) {
      onUploadError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Image
      </label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP or GIF (MAX. 10MB)
                </p>
              </>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};