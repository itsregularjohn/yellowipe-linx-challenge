import { Post, SignupResponse, CreatePostResponse, GetPostResponse, PostsList } from "@yellowipe-linx/schemas";
import { PrismaClient } from "../generated/prisma";

const BASE_URL = "http://localhost:4000";
const testDb = new PrismaClient();

describe("Módulo de Posts", () => {
  const testUser = {
    name: "User 1",
    email: "test1@example.com",
    password: "password123",
  };

  const secondUser = {
    name: "User 2",
    email: "test2@example.com",
    password: "password123",
  };

  let authToken: string;
  let userId: string;
  let secondAuthToken: string;
  let secondUserId: string

  beforeEach(async () => {

    // Criar primeiro usuário
    const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const signupData: SignupResponse = await signupResponse.json();
    authToken = signupData.token;
    userId = signupData.user.id;

    // Criar segundo usuário
    const secondSignupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secondUser),
    });

    const secondSignupData: SignupResponse = await secondSignupResponse.json();
    secondAuthToken = secondSignupData.token;
    secondUserId = secondSignupData.user.id;
  });

  describe("POST /v1/posts", () => {
    it("deve criar post com conteúdo texto", async () => {
      const postData = {
        content: "Este é meu primeiro post!",
      };

      const response = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const data: CreatePostResponse = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.content).toBe(postData.content);
      expect(data.userId).toBe(userId);
      expect(data.createdAt).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe(testUser.name);

      // Verificar no banco
      const post = await testDb.post.findUnique({
        where: { id: data.id },
      });
      expect(post).toBeDefined();
      expect(post?.content).toBe(postData.content);
    });


    it("deve rejeitar post sem conteúdo", async () => {
      const postData = {
        content: "",
      };

      const response = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar post sem autenticação", async () => {
      const postData = {
        content: "Este post não deveria ser criado",
      };

      const response = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /v1/posts", () => {
    beforeEach(async () => {
      // Criar alguns posts para teste
      const postsData = [
        { content: "Post 1" },
        { content: "Post 2" },
        { content: "Post com texto" },
      ];

      for (const postData of postsData) {
        await fetch(`${BASE_URL}/v1/posts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
      }

      // Criar post do segundo usuário
      await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post do segundo usuário" }),
      });
    });

    it("deve listar posts com paginação", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts?page=1&limit=2`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: PostsList = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.posts.length).toBeLessThanOrEqual(2);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.total).toBeGreaterThan(0);
      
      // Verificar estrutura dos posts
      expect(data.posts[0]).toHaveProperty("id");
      expect(data.posts[0]).toHaveProperty("content");
      expect(data.posts[0]).toHaveProperty("user");
      expect(data.posts[0]).toHaveProperty("createdAt");
      expect(data.posts[0].user).toHaveProperty("name");
    });

    it("deve ordenar posts por data decrescente", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: PostsList = await response.json();

      expect(response.status).toBe(200);
      
      // Verificar ordenação por data decrescente
      for (let i = 0; i < data.posts.length - 1; i++) {
        const currentDate = new Date(data.posts[i].createdAt);
        const nextDate = new Date(data.posts[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });


    it("deve funcionar sem autenticação (posts públicos)", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data: PostsList = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });
  });

  describe("GET /v1/posts/:id", () => {
    let postId: string;

    beforeEach(async () => {
      const postResponse = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post para busca individual" }),
      });

      const postData: CreatePostResponse = await postResponse.json();
      postId = postData.id;
    });

    it("deve buscar post por ID", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: GetPostResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(postId);
      expect(data.content).toBe("Post para busca individual");
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe(testUser.name);
    });

    it("deve retornar 404 para post inexistente", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/01INVALID123456789`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it("deve funcionar sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });
  });


  describe("DELETE /v1/posts/:id", () => {
    let postId: string;

    beforeEach(async () => {
      const postResponse = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post para deletar" }),
      });

      const postData: CreatePostResponse = await postResponse.json();
      postId = postData.id;
    });

    it("deve deletar próprio post", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verificar se foi deletado
      const checkResponse = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "GET",
      });
      expect(checkResponse.status).toBe(404);
    });

    it("deve rejeitar deleção de post de outro usuário", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it("deve rejeitar deleção sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/${postId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /v1/posts/user/:userId", () => {
    beforeEach(async () => {
      // Criar posts do primeiro usuário
      await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post do usuário 1" }),
      });

      // Criar post do segundo usuário
      await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post do usuário 2" }),
      });
    });

    it("deve listar posts de um usuário específico", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: PostsList = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.posts.length).toBeGreaterThan(0);
      
      // Todos os posts devem ser do usuário especificado
      data.posts.forEach((post: Post) => {
        expect(post.userId).toBe(userId);
      });
    });

    it("deve funcionar sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/posts/user/${userId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });

    it("deve retornar lista vazia para usuário sem posts", async () => {
      // Criar terceiro usuário sem posts
      const thirdUser = {
        name: "Third User",
        email: "thirdtest@example.com",
        password: "password123",
      };

      const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thirdUser),
      });

      const signupData: SignupResponse = await signupResponse.json();
      const thirdUserId = signupData.user.id;

      const response = await fetch(`${BASE_URL}/v1/posts/user/${thirdUserId}`, {
        method: "GET",
      });

      const data: PostsList = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts.length).toBe(0);
    });
  });
});