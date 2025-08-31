import type {
  CreateReactionInput,
  CreateReactionResponse,
  GetReactionsResponse,
  DeleteReactionInput,
} from "@yellowipe-linx/schemas";
import { apiRequest } from "../../core";

export const reactionsApi = {
  async createReaction(input: CreateReactionInput): Promise<CreateReactionResponse> {
    return apiRequest<CreateReactionResponse>("/reactions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getPostReactions(postId: string): Promise<GetReactionsResponse> {
    return apiRequest<GetReactionsResponse>(`/reactions/posts/${postId}`);
  },

  async getCommentReactions(commentId: string): Promise<GetReactionsResponse> {
    return apiRequest<GetReactionsResponse>(`/reactions/comments/${commentId}`);
  },

  async deleteReaction(input: DeleteReactionInput): Promise<void> {
    return apiRequest<void>(`/reactions/${input.id}`, {
      method: "DELETE",
    });
  },

  async deletePostReaction(postId: string): Promise<void> {
    return apiRequest<void>(`/reactions/posts/${postId}`, {
      method: "DELETE",
    });
  },

  async deleteCommentReaction(commentId: string): Promise<void> {
    return apiRequest<void>(`/reactions/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};