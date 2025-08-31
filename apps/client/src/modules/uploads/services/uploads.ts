import type {
  PresignedUrlInput,
  PresignedUrlResponse,
  ConfirmUploadInput,
  ConfirmUploadResponse,
  Upload,
  MyUploadsResponse,
  DeleteUploadResponse,
} from '@yellowipe-linx/schemas';
import { apiRequest } from '../../core';

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

