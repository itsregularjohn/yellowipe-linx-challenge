import { RequestContext, prisma, NotFoundError, ForbiddenError, requireUserContext } from "../../core";

export async function deletePost(
  context: RequestContext,
  id: string,
): Promise<void> {
  requireUserContext(context);
  
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw new NotFoundError("Post not found");
  }

  if (existingPost.userId !== context.userId) {
    throw new ForbiddenError("You can only delete your own posts");
  }

  await prisma.post.delete({
    where: { id },
  });
}