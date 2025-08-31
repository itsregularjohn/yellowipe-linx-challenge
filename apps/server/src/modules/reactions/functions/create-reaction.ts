import { CreateReactionInput, CreateReactionResponse } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";
import { BadRequestError, NotFoundError } from "../../core/errors";

export async function createReaction(
  context: RequestContext,
  input: CreateReactionInput,
): Promise<CreateReactionResponse> {
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
  
  // Remove any existing reaction from this user on this target
  if (input.postId) {
    await prisma.reaction.deleteMany({
      where: {
        userId: context.userId,
        postId: input.postId,
      },
    });
  }
  
  if (input.commentId) {
    await prisma.reaction.deleteMany({
      where: {
        userId: context.userId,
        commentId: input.commentId,
      },
    });
  }
  
  // Create the new reaction
  const reaction = await prisma.reaction.create({
    data: {
      type: input.type,
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
    },
  });

  return reaction;
}