import { RequestContext, BadRequestError, prisma } from "../../core";
import { generatePresignedViewUrl } from "./utils/s3";
import type { MyUploadsResponse } from "@yellowipe-linx/schemas";

export async function getMyUploads(
  context: RequestContext,
): Promise<MyUploadsResponse> {
  if (!context.userId) {
    throw new BadRequestError("User ID is required");
  }

  const uploads = await prisma.upload.findMany({
    where: { userId: context.userId },
    orderBy: { createdAt: "desc" },
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

  // Generate fresh presigned URLs for all uploads
  const uploadsWithFreshUrls = await Promise.all(
    uploads.map(async (upload) => ({
      ...upload,
      publicUrl: await generatePresignedViewUrl(upload.key),
    }))
  );

  return { uploads: uploadsWithFreshUrls };
}