import { CreateCommentInput, CreateCommentResponse } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";
import { BadRequestError, NotFoundError } from "../../core/errors";

export async function createComment(
  context: RequestContext,
  input: CreateCommentInput,
): Promise<CreateCommentResponse> {
  requireUserContext(context);
  
  // Validate that either postId or commentId is provided
  if (!input.postId && !input.commentId) {
    throw new BadRequestError("Must provide either postId or commentId");
  }
  
  if (input.postId && input.commentId) {
    throw new BadRequestError("Cannot provide both postId and commentId");
  }
  
  // Verify that the target exists
  if (input.postId) {
    const post = await prisma.post.findUnique({ where: { id: input.postId } });
    if (!post) {
      throw new NotFoundError("Post not found");
    }
  }
  
  if (input.commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: input.commentId } });
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
  }
  
  const comment = await prisma.comment.create({
    data: {
      content: input.content,
      postId: input.postId || null,
      commentId: input.commentId || null,
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
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return comment;
}