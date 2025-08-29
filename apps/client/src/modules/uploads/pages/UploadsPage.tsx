import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Layout } from '../../core/components/Layout';
import { FileUpload } from '../components/FileUpload';
import { uploadsApi, type Upload } from '../services/uploads';

export const UploadsPage: FC = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUploads = async () => {
    try {
      setIsLoading(true);
      const response = await uploadsApi.getMyUploads();
      setUploads(response.uploads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load uploads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const handleUploadSuccess = (upload: Upload) => {
    setUploads(prev => [upload, ...prev]);
    setSuccessMessage('File uploaded successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUploadError = (err: Error) => {
    setError(err.message);
    setTimeout(() => setError(null), 5000);
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!window.confirm('Are you sure you want to delete this upload? This action cannot be undone.')) {
      return;
    }

    try {
      await uploadsApi.deleteUpload(uploadId);
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
      setSuccessMessage('Upload deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete upload');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout title="My Uploads">
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload New File
            </h2>
            
            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </div>

        {/* Uploads List Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Uploads ({uploads.length})
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-600">Loading uploads...</span>
              </div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No uploads yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by uploading your first image above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="aspect-w-16 aspect-h-9 mb-3">
                      <img
                        src={upload.publicUrl}
                        alt={upload.originalFileName}
                        className="w-full h-48 object-cover rounded-md"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {upload.originalFileName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(upload.fileSize)} • {formatDate(upload.createdAt)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={upload.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteUpload(upload.id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};