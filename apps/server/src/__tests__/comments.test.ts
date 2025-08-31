import { SignupResponse, CreateCommentResponse, CommentsList, GetCommentResponse } from "@yellowipe-linx/schemas";

const BASE_URL = "http://localhost:4000";

const globalWithDb = globalThis as typeof globalThis & {
  testDb: any;
};

describe("Módulo de Comments", () => {
  const timestamp = Date.now();
  const testUser = {
    name: "Test User",
    email: `test-comments-${timestamp}@example.com`,
    password: "password123",
  };

  const secondUser = {
    name: "Second User",
    email: `test-second-${timestamp}@example.com`,
    password: "password123",
  };

  let authToken: string;
  let userId: string;
  let secondAuthToken: string;
  let secondUserId: string;
  let testPostId: string;

  beforeEach(async () => {
    // Criar primeiro usuário
    const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    if (!signupResponse.ok) {
      throw new Error(`First signup failed: ${await signupResponse.text()}`);
    }

    const signupData: SignupResponse = await signupResponse.json();
    authToken = signupData.token;
    userId = signupData.user.id;

    // Criar segundo usuário
    const secondSignupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secondUser),
    });

    if (!secondSignupResponse.ok) {
      throw new Error(`Second signup failed: ${await secondSignupResponse.text()}`);
    }

    const secondSignupData: SignupResponse = await secondSignupResponse.json();
    secondAuthToken = secondSignupData.token;
    secondUserId = secondSignupData.user.id;

    // Criar post para testar comentários
    const postResponse = await fetch(`${BASE_URL}/v1/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Post para comentários" }),
    });

    if (!postResponse.ok) {
      throw new Error(`Post creation failed: ${await postResponse.text()}`);
    }

    const postData = await postResponse.json();
    testPostId = postData.id;
  });

  describe("POST /v1/comments", () => {
    it("deve criar comentário em post", async () => {
      const commentData = {
        content: "Este é um comentário no post",
        postId: testPostId,
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      const data: CreateCommentResponse = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.content).toBe(commentData.content);
      expect(data.postId).toBe(testPostId);
      expect(data.commentId).toBeNull();
      expect(data.userId).toBe(userId);
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe(testUser.name);
      expect(data.createdAt).toBeDefined();

      // Verificar no banco
      const comment = await globalWithDb.testDb.comment.findUnique({
        where: { id: data.id },
      });
      expect(comment).toBeDefined();
      expect(comment?.content).toBe(commentData.content);
    });

    it("deve criar comentário em outro comentário (reply)", async () => {
      // Primeiro criar um comentário
      const firstCommentResponse = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Comentário original",
          postId: testPostId,
        }),
      });

      const firstComment = await firstCommentResponse.json();

      // Agora comentar no comentário
      const replyData = {
        content: "Esta é uma resposta ao comentário",
        commentId: firstComment.id,
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(replyData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.content).toBe(replyData.content);
      expect(data.commentId).toBe(firstComment.id);
      expect(data.postId).toBeNull();
      expect(data.userId).toBe(secondUserId);
    });

    it("deve rejeitar comentário sem conteúdo", async () => {
      const commentData = {
        content: "",
        postId: testPostId,
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar comentário sem autenticação", async () => {
      const commentData = {
        content: "Comentário sem auth",
        postId: testPostId,
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });

      expect(response.status).toBe(401);
    });

    it("deve rejeitar quando não há postId nem commentId", async () => {
      const commentData = {
        content: "Comentário válido",
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar postId inexistente", async () => {
      const commentData = {
        content: "Comentário em post inexistente",
        postId: "01INVALID123456789",
      };

      const response = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /v1/comments/post/:postId", () => {
    beforeEach(async () => {
      // Criar alguns comentários no post
      const comments = [
        "Primeiro comentário",
        "Segundo comentário", 
        "Terceiro comentário",
      ];

      for (const content of comments) {
        await fetch(`${BASE_URL}/v1/comments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            postId: testPostId,
          }),
        });
      }

      // Criar comentário do segundo usuário
      await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Comentário do segundo usuário",
          postId: testPostId,
        }),
      });
    });

    it("deve listar comentários de um post", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/post/${testPostId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: CommentsList = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.comments)).toBe(true);
      expect(data.comments.length).toBeGreaterThan(0);
      
      // Verificar estrutura dos comentários
      expect(data.comments[0]).toHaveProperty("id");
      expect(data.comments[0]).toHaveProperty("content");
      expect(data.comments[0]).toHaveProperty("user");
      expect(data.comments[0]).toHaveProperty("postId");
      expect(data.comments[0]).toHaveProperty("commentId");
      expect(data.comments[0]).toHaveProperty("createdAt");
      expect(data.comments[0].user).toHaveProperty("name");

      // Todos os comentários devem ser do post especificado
      data.comments.forEach((comment) => {
        expect(comment.postId).toBe(testPostId);
        expect(comment.commentId).toBeNull();
      });
    });

    it("deve ordenar comentários por data crescente", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/post/${testPostId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verificar ordenação por data crescente (comentários mais antigos primeiro)
      for (let i = 0; i < data.comments.length - 1; i++) {
        const currentDate = new Date(data.comments[i].createdAt);
        const nextDate = new Date(data.comments[i + 1].createdAt);
        expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
      }
    });

    it("deve funcionar sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/post/${testPostId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.comments)).toBe(true);
    });

    it("deve retornar lista vazia para target sem comentários", async () => {
      // Criar novo post sem comentários
      const newPostResponse = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post sem comentários" }),
      });

      const newPost = await newPostResponse.json();

      const response = await fetch(`${BASE_URL}/v1/comments/post/${newPost.id}`, {
        method: "GET",
      });

      const data: CommentsList = await response.json();

      expect(response.status).toBe(200);
      expect(data.comments.length).toBe(0);
    });
  });

  describe("GET /v1/comments/:id", () => {
    let commentId: string;

    beforeEach(async () => {
      const commentResponse = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Comentário para busca individual",
          postId: testPostId,
        }),
      });

      const commentData = await commentResponse.json();
      commentId = commentData.id;
    });

    it("deve buscar comentário por ID", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: GetCommentResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(commentId);
      expect(data.content).toBe("Comentário para busca individual");
      expect(data.user).toBeDefined();
    });

    it("deve retornar 404 para comentário inexistente", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/01INVALID123456789`, {
        method: "GET",
      });

      expect(response.status).toBe(404);
    });

    it("deve funcionar sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /v1/comments/:id", () => {
    let commentId: string;

    beforeEach(async () => {
      const commentResponse = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Comentário para deletar",
          postId: testPostId,
        }),
      });

      const commentData = await commentResponse.json();
      commentId = commentData.id;
    });

    it("deve deletar próprio comentário", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verificar se foi deletado
      const checkResponse = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "GET",
      });
      expect(checkResponse.status).toBe(404);
    });

    it("deve rejeitar deleção de comentário de outro usuário", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it("deve rejeitar deleção sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${commentId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Comentários aninhados (replies)", () => {
    let parentCommentId: string;
    let childCommentId: string;

    beforeEach(async () => {
      // Criar comentário pai
      const parentResponse = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Comentário pai",
          postId: testPostId,
        }),
      });

      const parentData = await parentResponse.json();
      parentCommentId = parentData.id;

      // Criar comentário filho (reply)
      const childResponse = await fetch(`${BASE_URL}/v1/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Resposta ao comentário",
          commentId: parentCommentId,
        }),
      });

      const childData = await childResponse.json();
      childCommentId = childData.id;
    });

    it("deve listar comentários de um comentário (replies)", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/comment/${parentCommentId}`, {
        method: "GET",
      });

      const data: CommentsList = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.comments)).toBe(true);
      expect(data.comments.length).toBe(1);
      expect(data.comments[0].id).toBe(childCommentId);
      expect(data.comments[0].commentId).toBe(parentCommentId);
      expect(data.comments[0].postId).toBeNull();
    });

    it("deve deletar comentário pai e manter replies", async () => {
      const response = await fetch(`${BASE_URL}/v1/comments/${parentCommentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Reply deve ainda existir
      const replyResponse = await fetch(`${BASE_URL}/v1/comments/${childCommentId}`, {
        method: "GET",
      });

      expect(replyResponse.status).toBe(200);
    });
  });
});