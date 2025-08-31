import { DeletePostReactionInput } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";
import { NotFoundError } from "../../core/errors";

export async function deletePostReaction(
  context: RequestContext,
  input: DeletePostReactionInput,
): Promise<void> {
  requireUserContext(context);
  
  // Find the user's reaction on this post
  const reaction = await prisma.reaction.findFirst({
    where: {
      postId: input.postId,
      userId: context.userId,
    },
  });
  
  if (!reaction) {
    throw new NotFoundError("No reaction found from this user on this post");
  }
  
  // Delete the reaction
  await prisma.reaction.delete({
    where: { id: reaction.id },
  });
}