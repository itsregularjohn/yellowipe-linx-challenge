import { DeleteCommentReactionInput } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";
import { NotFoundError } from "../../core/errors";

export async function deleteCommentReaction(
  context: RequestContext,
  input: DeleteCommentReactionInput,
): Promise<void> {
  requireUserContext(context);
  
  // Find the user's reaction on this comment
  const reaction = await prisma.reaction.findFirst({
    where: {
      commentId: input.commentId,
      userId: context.userId,
    },
  });
  
  if (!reaction) {
    throw new NotFoundError("No reaction found from this user on this comment");
  }
  
  // Delete the reaction
  await prisma.reaction.delete({
    where: { id: reaction.id },
  });
}