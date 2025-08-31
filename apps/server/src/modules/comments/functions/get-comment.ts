import { GetCommentResponse } from "@yellowipe-linx/schemas";
import { RequestContext, prisma } from "../../core";
import { NotFoundError } from "../../core/errors";

export async function getComment(
  context: RequestContext,
  id: string,
): Promise<GetCommentResponse> {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  return comment;
}