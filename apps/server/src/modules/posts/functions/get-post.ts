import { GetPostResponse } from "@yellowipe/schemas";
import { RequestContext, prisma, NotFoundError } from "../../core";

export async function getPost(
  context: RequestContext,
  id: string,
): Promise<GetPostResponse> {
  const post = await prisma.post.findUnique({
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

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  return post;
}