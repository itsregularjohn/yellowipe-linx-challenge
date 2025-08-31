import { GetCommentReactionsInput, GetReactionsResponse, ReactionType } from "@yellowipe-linx/schemas";
import { RequestContext, prisma } from "../../core";
import { NotFoundError } from "../../core/errors";

export async function getCommentReactions(
  context: RequestContext,
  input: GetCommentReactionsInput,
): Promise<GetReactionsResponse> {
  // Verify that the comment exists
  const comment = await prisma.comment.findUnique({ where: { id: input.commentId } });
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }
  
  // Get all reactions for this comment
  const reactions = await prisma.reaction.findMany({
    where: {
      commentId: input.commentId,
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
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Calculate summary
  const summary = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type as ReactionType] = (acc[reaction.type as ReactionType] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    {
      like: 0,
      love: 0,
      laugh: 0,
      angry: 0,
      sad: 0,
      total: 0,
    }
  );
  
  return {
    reactions,
    summary,
  };
}