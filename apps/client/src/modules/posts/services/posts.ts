import type {
  Post,
  PostsList,
  CreatePostInput,
} from '@yellowipe/schemas';
import { apiRequest } from '../../core';

export const postsApi = {
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsList> {
    return apiRequest<PostsList>(`/posts?page=${page}&limit=${limit}`);
  },

  async getPost(id: string): Promise<Post> {
    return apiRequest<Post>(`/posts/${id}`);
  },

  async createPost(input: CreatePostInput): Promise<Post> {
    return apiRequest<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async deletePost(id: string): Promise<void> {
    return apiRequest<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PostsList> {
    return apiRequest<PostsList>(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  },
};

