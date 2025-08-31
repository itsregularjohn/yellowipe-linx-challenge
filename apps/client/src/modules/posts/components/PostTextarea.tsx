import type { FC } from "react";
import { useState } from "react";
import type { CreatePostInput } from "@yellowipe-linx/schemas";
import { useAuth } from "../../auth/contexts/AuthContext";
import { uploadsApi } from "../../uploads/services/uploads";

interface PostTextareaProps {
  onPostCreated: () => void;
  onSubmit: (postData: CreatePostInput) => Promise<void>;
}

export const PostTextarea: FC<PostTextareaProps> = ({
  onPostCreated,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const upload = await uploadsApi.uploadFile(file);
      setUploadedImageId(upload.id);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setUploadedImageId(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const postData: CreatePostInput = {
        content: content.trim(),
        ...(uploadedImageId && { uploadId: uploadedImageId }),
      };

      await onSubmit(postData);

      // Reset form
      setContent("");
      setSelectedFile(null);
      setUploadedImageId(null);
      onPostCreated();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !content.trim() || isSubmitting || isUploading;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* User Info */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-900">{user?.name}</p>
        </div>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {/* Selected Image Preview */}
      {selectedFile && (
        <div className="mb-4 relative">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            className="max-w-full h-64 object-contain rounded-lg border"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            disabled={isUploading}
          >
            ×
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Image Upload Button */}
          <label className="cursor-pointer inline-flex items-center text-gray-600 hover:text-gray-800">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isSubmitting}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`px-6 py-2 rounded-lg font-medium ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};
