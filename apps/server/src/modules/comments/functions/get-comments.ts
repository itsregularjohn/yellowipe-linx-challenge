import { CommentsList } from "@yellowipe-linx/schemas";
import { RequestContext, prisma } from "../../core";

export async function getPostComments(
  context: RequestContext,
  postId: string,
): Promise<CommentsList> {
  const comments = await prisma.comment.findMany({
    where: { 
      postId,
      commentId: null // Only top-level comments on the post
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
    orderBy: {
      createdAt: 'asc',
    },
  });

  return { comments };
}

export async function getCommentReplies(
  context: RequestContext,
  commentId: string,
): Promise<CommentsList> {
  const comments = await prisma.comment.findMany({
    where: { 
      commentId,
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
    orderBy: {
      createdAt: 'asc',
    },
  });

  return { comments };
}