import { RequestContext, BadRequestError, prisma, env } from "../../core";
import { validateUploadKey, generatePresignedViewUrl } from "./utils/s3";
import type { ConfirmUploadInput, ConfirmUploadResponse } from "@yellowipe/schemas";

export async function confirmUpload(
  context: RequestContext,
  input: ConfirmUploadInput,
): Promise<ConfirmUploadResponse> {
  if (!context.userId) {
    throw new BadRequestError("User ID is required");
  }

  // Validate that the key belongs to the user
  if (!validateUploadKey(input.key, context.userId)) {
    throw new BadRequestError("Invalid upload key");
  }

  // Generate presigned view URL
  const publicUrl = await generatePresignedViewUrl(input.key);

  // Save to database
  const upload = await prisma.upload.create({
    data: {
      key: input.key,
      originalFileName: input.originalFileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      publicUrl,
      userId: context.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    ...upload,
    publicUrl: await generatePresignedViewUrl(input.key), // Fresh presigned URL for response
  };
}