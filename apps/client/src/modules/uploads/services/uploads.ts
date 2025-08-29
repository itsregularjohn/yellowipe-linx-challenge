import type {
  PresignedUrlInput,
  PresignedUrlResponse,
  ConfirmUploadInput,
  ConfirmUploadResponse,
  Upload,
  MyUploadsResponse,
  DeleteUploadResponse,
} from '@yellowipe/schemas';
import { API_BASE_URL, AUTH_STORAGE_KEY } from '../../../constants';

class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || errorData.error || 'Request failed');
  }

  const result = await response.json();
  return result.data || result;
}

export const uploadsApi = {
  async getPresignedUrl(request: PresignedUrlInput): Promise<PresignedUrlResponse> {
    return apiRequest<PresignedUrlResponse>('/uploads/presigned-url', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async confirmUpload(request: ConfirmUploadInput): Promise<ConfirmUploadResponse> {
    return apiRequest<ConfirmUploadResponse>('/uploads/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getMyUploads(): Promise<MyUploadsResponse> {
    return apiRequest<MyUploadsResponse>('/uploads/my-uploads');
  },

  async deleteUpload(uploadId: string): Promise<DeleteUploadResponse> {
    return apiRequest<DeleteUploadResponse>(`/uploads/${uploadId}`, {
      method: 'DELETE',
    });
  },

  async uploadFile(file: File): Promise<Upload> {
    // Get presigned URL
    const presignedResponse = await this.getPresignedUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    // Upload file to S3
    await fetch(presignedResponse.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Confirm upload
    return this.confirmUpload({
      key: presignedResponse.key,
      originalFileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  },
};

export { ApiError };