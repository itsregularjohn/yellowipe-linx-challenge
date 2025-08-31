import { CreatePostInput, CreatePostResponse } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";

export async function createPost(
  context: RequestContext,
  input: CreatePostInput,
): Promise<CreatePostResponse> {
  requireUserContext(context);
  
  const post = await prisma.post.create({
    data: {
      content: input.content,
      uploadId: input.uploadId,
      userId: context.userId,
    },
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