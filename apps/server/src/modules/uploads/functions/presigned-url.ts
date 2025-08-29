import { RequestContext, BadRequestError, prisma } from "../../core";
import { generatePresignedUrl } from "./utils/s3";
import type { PresignedUrlInput, PresignedUrlResponse } from "@yellowipe/schemas";

export async function createPresignedUrl(
  context: RequestContext,
  input: PresignedUrlInput,
): Promise<PresignedUrlResponse> {
  if (!context.userId) {
    throw new BadRequestError("User ID is required");
  }

  try {
    const result = await generatePresignedUrl({
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      userId: context.userId,
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate presigned URL";
    throw new BadRequestError(message);
  }
}