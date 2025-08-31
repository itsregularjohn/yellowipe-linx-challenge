import { SignupResponse, CreateReactionResponse, GetReactionsResponse, Reaction } from "@yellowipe-linx/schemas";
import { PrismaClient } from "../generated/prisma";

const BASE_URL = "http://localhost:4000";
const testDb = new PrismaClient();

describe("Módulo de Reactions", () => {
  const timestamp = Date.now();
  const testUser = {
    name: "Test User",
    email: `test-reactions-${timestamp}@example.com`,
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
  let testCommentId: string;

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

    // Criar post para testar reações
    const postResponse = await fetch(`${BASE_URL}/v1/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Post para reações" }),
    });

    const postData = await postResponse.json();
    testPostId = postData.id;

    // Criar comentário para testar reações
    const commentResponse = await fetch(`${BASE_URL}/v1/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Comentário para reações",
        postId: testPostId,
      }),
    });

    const commentData = await commentResponse.json();
    testCommentId = commentData.id;
  });

  describe("POST /v1/reactions", () => {
    it("deve criar reação em post", async () => {
      const reactionData = {
        postId: testPostId,
        type: "like",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      const data: CreateReactionResponse = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.postId).toBe(testPostId);
      expect(data.commentId).toBeNull();
      expect(data.type).toBe("like");
      expect(data.userId).toBe(userId);
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe(testUser.name);
      expect(data.createdAt).toBeDefined();

      // Verificar no banco
      const reaction = await testDb.reaction.findUnique({
        where: { id: data.id },
      });
      expect(reaction).toBeDefined();
      expect(reaction?.type).toBe("like");
    });

    it("deve criar reação em comentário", async () => {
      const reactionData = {
        commentId: testCommentId,
        type: "love",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      const data: CreateReactionResponse = await response.json();

      expect(response.status).toBe(201);
      expect(data.commentId).toBe(testCommentId);
      expect(data.postId).toBeNull();
      expect(data.type).toBe("love");
      expect(data.userId).toBe(secondUserId);
    });

    it("deve suportar diferentes tipos de reação", async () => {
      const reactionTypes = ["like", "love", "laugh", "angry", "sad"];

      for (const type of reactionTypes) {
        const reactionData = {
          postId: testPostId,
          type,
        };

        const response = await fetch(`${BASE_URL}/v1/reactions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secondAuthToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reactionData),
        });

        expect(response.status).toBe(201);
        const data: CreateReactionResponse = await response.json();
        expect(data.type).toBe(type);

        // Limpar para próxima iteração
        await fetch(`${BASE_URL}/v1/reactions/${data.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${secondAuthToken}`,
          },
        });
      }
    });

    it("deve rejeitar tipo de reação inválido", async () => {
      const reactionData = {
        postId: testPostId,
        type: "invalid-type",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar quando nem postId nem commentId são fornecidos", async () => {
      const reactionData = {
        type: "like",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar quando tanto postId quanto commentId são fornecidos", async () => {
      const reactionData = {
        postId: testPostId,
        commentId: testCommentId,
        type: "like",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar postId inexistente", async () => {
      const reactionData = {
        postId: "01INVALID123456789",
        type: "like",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reactionData),
      });

      expect(response.status).toBe(404);
    });

    it("deve rejeitar reação sem autenticação", async () => {
      const reactionData = {
        postId: testPostId,
        type: "like",
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reactionData),
      });

      expect(response.status).toBe(401);
    });

    it("deve substituir reação existente do mesmo usuário", async () => {
      // Criar primeira reação
      const firstReactionData = {
        postId: testPostId,
        type: "like",
      };

      const firstResponse = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(firstReactionData),
      });

      const firstReaction: CreateReactionResponse = await firstResponse.json();
      expect(firstResponse.status).toBe(201);

      // Criar segunda reação no mesmo target
      const secondReactionData = {
        postId: testPostId,
        type: "love",
      };

      const secondResponse = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(secondReactionData),
      });

      const secondReaction: CreateReactionResponse = await secondResponse.json();
      expect(secondResponse.status).toBe(201);

      // A primeira reação deve ter sido removida
      const checkFirstReaction = await testDb.reaction.findUnique({
        where: { id: firstReaction.id },
      });
      expect(checkFirstReaction).toBeNull();

      // A segunda reação deve existir
      const checkSecondReaction = await testDb.reaction.findUnique({
        where: { id: secondReaction.id },
      });
      expect(checkSecondReaction).toBeDefined();
      expect(checkSecondReaction?.type).toBe("love");
    });
  });

  describe("GET /v1/reactions/posts/:postId and /v1/reactions/comments/:commentId", () => {
    beforeEach(async () => {
      // Criar várias reações no post
      const reactions = [
        { user: authToken, userId, type: "like" },
        { user: secondAuthToken, userId: secondUserId, type: "love" },
      ];

      for (const reaction of reactions) {
        await fetch(`${BASE_URL}/v1/reactions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${reaction.user}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: testPostId,
            type: reaction.type,
          }),
        });
      }
    });

    it("deve listar reações de um post", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data: GetReactionsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.reactions)).toBe(true);
      expect(data.reactions.length).toBeGreaterThan(0);
      
      // Verificar estrutura das reações
      expect(data.reactions[0]).toHaveProperty("id");
      expect(data.reactions[0]).toHaveProperty("type");
      expect(data.reactions[0]).toHaveProperty("user");
      expect(data.reactions[0]).toHaveProperty("postId");
      expect(data.reactions[0]).toHaveProperty("commentId");
      expect(data.reactions[0]).toHaveProperty("createdAt");
      expect(data.reactions[0].user).toHaveProperty("name");

      // Todas as reações devem ser do post especificado
      data.reactions.forEach((reaction: Reaction) => {
        expect(reaction.postId).toBe(testPostId);
        expect(reaction.commentId).toBeNull();
      });
    });

    it("deve incluir contagem agrupada por tipo", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "GET",
      });

      const data: GetReactionsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.summary).toBeDefined();
      expect(typeof data.summary).toBe("object");
      
      // Verificar que temos contagens
      expect(data.summary.like).toBeDefined();
      expect(data.summary.love).toBeDefined();
      expect(data.summary.total).toBeDefined();
      expect(data.summary.total).toBeGreaterThan(0);
    });

    it("deve funcionar sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data: GetReactionsResponse = await response.json();
      expect(Array.isArray(data.reactions)).toBe(true);
    });

    it("deve retornar lista vazia para target sem reações", async () => {
      // Criar novo post sem reações
      const newPostResponse = await fetch(`${BASE_URL}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Post sem reações" }),
      });

      const newPost = await newPostResponse.json();

      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${newPost.id}`, {
        method: "GET",
      });

      const data: GetReactionsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.reactions.length).toBe(0);
      expect(data.summary.total).toBe(0);
    });
  });

  describe("DELETE /v1/reactions/:id", () => {
    let reactionId: string;

    beforeEach(async () => {
      const reactionResponse = await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: testPostId,
          type: "like",
        }),
      });

      const reactionData = await reactionResponse.json();
      reactionId = reactionData.id;
    });

    it("deve deletar própria reação", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/${reactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verificar se foi deletado
      const reaction = await testDb.reaction.findUnique({
        where: { id: reactionId },
      });
      expect(reaction).toBeNull();
    });

    it("deve rejeitar deleção de reação de outro usuário", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/${reactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it("deve rejeitar deleção sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/${reactionId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });

    it("deve retornar 404 para reação inexistente", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/01INVALID123456789`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /v1/reactions/posts/:postId and /v1/reactions/comments/:commentId", () => {
    beforeEach(async () => {
      // Criar reação para remover
      await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: testPostId,
          type: "like",
        }),
      });
    });

    it("deve remover reação do usuário em post específico", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verificar que não há reação do usuário no post
      const reactions = await testDb.reaction.findMany({
        where: {
          postId: testPostId,
          userId,
        },
      });
      expect(reactions.length).toBe(0);
    });

    it("deve retornar 404 se usuário não tem reação no post", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`, // usuário sem reação
        },
      });

      expect(response.status).toBe(404);
    });

    it("deve rejeitar deleção sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/posts/${testPostId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Reações em comentários", () => {
    beforeEach(async () => {
      // Criar reação no comentário
      await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: testCommentId,
          type: "like",
        }),
      });

      // Criar reação de outro usuário
      await fetch(`${BASE_URL}/v1/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: testCommentId,
          type: "love",
        }),
      });
    });

    it("deve listar reações de um comentário", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/comments/${testCommentId}`, {
        method: "GET",
      });

      const data: GetReactionsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.reactions)).toBe(true);
      expect(data.reactions.length).toBe(2);
      
      // Todas as reações devem ser do comentário especificado
      data.reactions.forEach((reaction: Reaction) => {
        expect(reaction.commentId).toBe(testCommentId);
        expect(reaction.postId).toBeNull();
      });
    });

    it("deve incluir contagem agrupada por tipo para comentários", async () => {
      const response = await fetch(`${BASE_URL}/v1/reactions/comments/${testCommentId}`, {
        method: "GET",
      });

      const data: GetReactionsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.summary).toBeDefined();
      expect(data.summary.like).toBe(1);
      expect(data.summary.love).toBe(1);
      expect(data.summary.total).toBe(2);
    });
  });
});