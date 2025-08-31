import { GetPostReactionsInput, GetReactionsResponse, ReactionType } from "@yellowipe-linx/schemas";
import { RequestContext, prisma } from "../../core";
import { NotFoundError } from "../../core/errors";

export async function getPostReactions(
  context: RequestContext,
  input: GetPostReactionsInput,
): Promise<GetReactionsResponse> {
  // Verify that the post exists
  const post = await prisma.post.findUnique({ where: { id: input.postId } });
  if (!post) {
    throw new NotFoundError("Post not found");
  }
  
  // Get all reactions for this post
  const reactions = await prisma.reaction.findMany({
    where: {
      postId: input.postId,
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