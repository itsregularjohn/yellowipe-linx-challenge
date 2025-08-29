import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ulid } from "ulid";
import { env } from "../../../core";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
});

const BUCKET_NAME = env.AWS_S3_BUCKET_NAME;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/gif",
];

export interface GeneratePresignedUrlParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export function validateUpload(params: GeneratePresignedUrlParams): void {
  if (!params.fileName || params.fileName.trim() === "") {
    throw new Error("File name is required");
  }

  if (params.fileSize > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(params.fileType)) {
    throw new Error(`File type not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }
}

export function generateUploadKey(userId: string, fileName: string): string {
  const fileExtension = fileName.split(".").pop();
  const uniqueId = ulid();
  return `uploads/${userId}/${uniqueId}.${fileExtension}`;
}

export async function generatePresignedUrl(params: GeneratePresignedUrlParams): Promise<PresignedUrlResponse> {
  validateUpload(params);

  const key = generateUploadKey(params.userId, params.fileName);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: params.fileType,
    ContentLength: params.fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 300, // 5 minutes
  });

  // Generate presigned URL for viewing the file
  const viewUrl = await generatePresignedViewUrl(key);

  return {
    uploadUrl,
    key,
    publicUrl: viewUrl,
  };
}

export async function generatePresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export function validateUploadKey(key: string, userId: string): boolean {
  return key.startsWith(`uploads/${userId}/`);
}