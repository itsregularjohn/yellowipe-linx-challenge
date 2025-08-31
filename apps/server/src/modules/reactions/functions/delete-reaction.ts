import { DeleteReactionInput } from "@yellowipe-linx/schemas";
import { RequestContext, prisma, requireUserContext } from "../../core";
import { ForbiddenError, NotFoundError } from "../../core/errors";

export async function deleteReaction(
  context: RequestContext,
  input: DeleteReactionInput,
): Promise<void> {
  requireUserContext(context);
  
  // Find the reaction
  const reaction = await prisma.reaction.findUnique({
    where: { id: input.id },
  });
  
  if (!reaction) {
    throw new NotFoundError("Reaction not found");
  }
  
  // Check if the user owns this reaction
  if (reaction.userId !== context.userId) {
    throw new ForbiddenError("You can only delete your own reactions");
  }
  
  // Delete the reaction
  await prisma.reaction.delete({
    where: { id: input.id },
  });
}