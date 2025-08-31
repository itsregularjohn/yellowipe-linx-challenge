import { UpdatePostInput, UpdatePostResponse } from "@yellowipe/schemas";
import { RequestContext, prisma, NotFoundError, ForbiddenError, requireUserContext } from "../../core";

export async function updatePost(
  context: RequestContext,
  id: string,
  input: UpdatePostInput,
): Promise<UpdatePostResponse> {
  requireUserContext(context);
  
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw new NotFoundError("Post not found");
  }

  if (existingPost.userId !== context.userId) {
    throw new ForbiddenError("You can only update your own posts");
  }

  const post = await prisma.post.update({
    where: { id },
    data: input,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      upload: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  return post;
}