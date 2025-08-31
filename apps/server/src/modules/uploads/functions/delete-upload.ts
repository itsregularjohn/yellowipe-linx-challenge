import { RequestContext, BadRequestError, NotFoundError, prisma } from "../../core";
import { deleteFromS3 } from "./utils/s3";
import type { DeleteUploadParams, DeleteUploadResponse } from "@yellowipe-linx/schemas";

export interface DeleteUploadInput {
  uploadId: string;
}

export async function deleteUpload(
  context: RequestContext,
  input: DeleteUploadInput,
): Promise<DeleteUploadResponse> {
  if (!context.userId) {
    throw new BadRequestError("User ID is required");
  }

  // Find the upload and verify ownership
  const upload = await prisma.upload.findUnique({
    where: { id: input.uploadId },
  });

  if (!upload) {
    throw new NotFoundError("Upload not found");
  }

  if (upload.userId !== context.userId) {
    throw new BadRequestError("You can only delete your own uploads");
  }

  try {
    // Delete from S3
    await deleteFromS3(upload.key);

    // Delete from database
    await prisma.upload.delete({
      where: { id: input.uploadId },
    });

    return { message: "Upload deleted successfully" };
  } catch (error) {
    console.error("Error deleting upload:", error);
    throw new BadRequestError("Failed to delete upload");
  }
}