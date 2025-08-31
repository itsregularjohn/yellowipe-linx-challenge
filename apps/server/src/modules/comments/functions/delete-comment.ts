import { RequestContext, prisma, requireUserContext } from "../../core";
import { NotFoundError, ForbiddenError } from "../../core/errors";

export async function deleteComment(
  context: RequestContext,
  id: string,
): Promise<void> {
  requireUserContext(context);
  
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (comment.userId !== context.userId) {
    throw new ForbiddenError("You can only delete your own comments");
  }

  await prisma.comment.delete({
    where: { id },
  });
}