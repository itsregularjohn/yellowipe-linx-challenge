import { PostsList } from "@yellowipe-linx/schemas";
import { RequestContext, prisma } from "../../core";

export async function getUserPosts(
  context: RequestContext,
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsList> {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
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
    }),
    prisma.post.count({
      where: { userId },
    }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
    },
  };
}