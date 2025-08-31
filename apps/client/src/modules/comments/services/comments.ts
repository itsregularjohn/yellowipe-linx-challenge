import type {
  Comment,
  CommentsList,
  CreateCommentInput,
  CreateCommentResponse,
  GetCommentResponse,
} from "@yellowipe-linx/schemas";
import { apiRequest } from "../../core";

export const commentsApi = {
  async getPostComments(postId: string): Promise<CommentsList> {
    return apiRequest<CommentsList>(`/comments/post/${postId}`);
  },

  async getCommentReplies(commentId: string): Promise<CommentsList> {
    return apiRequest<CommentsList>(`/comments/comment/${commentId}`);
  },

  async getComment(id: string): Promise<GetCommentResponse> {
    return apiRequest<GetCommentResponse>(`/comments/${id}`);
  },

  async createComment(
    input: CreateCommentInput
  ): Promise<CreateCommentResponse> {
    return apiRequest<CreateCommentResponse>("/comments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteComment(id: string): Promise<void> {
    return apiRequest<void>(`/comments/${id}`, {
      method: "DELETE",
    });
  },
};
