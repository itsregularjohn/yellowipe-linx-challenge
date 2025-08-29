const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

describe("Módulo de Uploads", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    authToken = signupData.token;
    userId = signupData.user.id;
  });

  describe("POST /v1/uploads/presigned-url", () => {
    it("deve gerar URL pré-assinada para upload válido", async () => {
      const uploadData = {
        fileName: "test-image.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000, // 1MB
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.uploadUrl).toBeDefined();
      expect(data.key).toBeDefined();
      expect(data.publicUrl).toBeDefined();
      expect(typeof data.uploadUrl).toBe("string");
      expect(data.uploadUrl).toContain("https://");
      expect(data.key).toContain(userId);
      expect(data.key).toContain(".jpg");
    });

    it("deve rejeitar tipo de arquivo não suportado", async () => {
      const uploadData = {
        fileName: "test-file.exe",
        fileType: "application/x-executable",
        fileSize: 1024000,
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar arquivo muito grande", async () => {
      const uploadData = {
        fileName: "large-image.jpg",
        fileType: "image/jpeg",
        fileSize: 11 * 1024 * 1024, // 11MB (limite é 10MB)
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      expect(response.status).toBe(400);
    });

    it("deve rejeitar requisição sem autenticação", async () => {
      const uploadData = {
        fileName: "test-image.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000,
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadData),
      });

      expect(response.status).toBe(401);
    });

    it("deve rejeitar dados inválidos", async () => {
      const uploadData = {
        fileName: "", // fileName vazio
        fileType: "image/jpeg",
        fileSize: 1024000,
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      expect(response.status).toBe(400);
    });

    it("deve suportar diferentes tipos de imagem", async () => {
      const imageTypes = [
        { fileName: "test.jpg", fileType: "image/jpeg" },
        { fileName: "test.png", fileType: "image/png" },
        { fileName: "test.webp", fileType: "image/webp" },
        { fileName: "test.gif", fileType: "image/gif" },
      ];

      for (const imageType of imageTypes) {
        const uploadData = {
          ...imageType,
          fileSize: 1024000,
        };

        const response = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.uploadUrl).toBeDefined();
      }
    });
  });

  describe("POST /v1/uploads/confirm", () => {
    let uploadKey: string;

    beforeEach(async () => {
      const uploadData = {
        fileName: "test-image.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000,
      };

      const presignedResponse = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      const presignedData = await presignedResponse.json();
      uploadKey = presignedData.key;
    });

    it("deve confirmar upload e salvar metadados no banco", async () => {
      const confirmData = {
        key: uploadKey,
        originalFileName: "test-image.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.key).toBe(uploadKey);
      expect(data.originalFileName).toBe("test-image.jpg");
      expect(data.publicUrl).toBeDefined();
      expect(data.userId).toBe(userId);

      // Verificar se foi salvo no banco de dados
      const testDb = (globalThis as any).testDb;
      const upload = await testDb.upload.findUnique({
        where: { id: data.id },
      });

      expect(upload).toBeDefined();
      expect(upload?.key).toBe(uploadKey);
      expect(upload?.userId).toBe(userId);
    });

    it("deve rejeitar confirmação sem autenticação", async () => {
      const confirmData = {
        key: uploadKey,
        originalFileName: "test-image.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmData),
      });

      expect(response.status).toBe(401);
    });

    it("deve rejeitar key inválida", async () => {
      const confirmData = {
        key: "invalid-key",
        originalFileName: "test-image.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
      };

      const response = await fetch(`${BASE_URL}/v1/uploads/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmData),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /v1/uploads/my-uploads", () => {
    beforeEach(async () => {
      // Criar alguns uploads para teste
      const uploadData = {
        fileName: "test-image-1.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000,
      };

      const presignedResponse = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      const presignedData = await presignedResponse.json();

      await fetch(`${BASE_URL}/v1/uploads/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: presignedData.key,
          originalFileName: "test-image-1.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
        }),
      });
    });

    it("deve listar uploads do usuário", async () => {
      const response = await fetch(`${BASE_URL}/v1/uploads/my-uploads`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.uploads)).toBe(true);
      expect(data.uploads.length).toBeGreaterThan(0);
      expect(data.uploads[0]).toHaveProperty("id");
      expect(data.uploads[0]).toHaveProperty("originalFileName");
      expect(data.uploads[0]).toHaveProperty("publicUrl");
      expect(data.uploads[0]).toHaveProperty("createdAt");
    });

    it("deve rejeitar requisição sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/uploads/my-uploads`, {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });

    it("deve retornar lista vazia para usuário sem uploads", async () => {
      // Criar outro usuário com email único
      const newUser = {
        name: "New User",
        email: `newuser-test-${Date.now()}@example.com`,
        password: "password123",
      };

      const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const signupData = await signupResponse.json();
      const newAuthToken = signupData.token;

      const response = await fetch(`${BASE_URL}/v1/uploads/my-uploads`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${newAuthToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.uploads)).toBe(true);
      expect(data.uploads.length).toBe(0);
    });
  });

  describe("DELETE /v1/uploads/:uploadId", () => {
    let uploadId: string;

    beforeEach(async () => {
      // Create an upload to delete
      const uploadData = {
        fileName: "delete-test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000,
      };

      const presignedResponse = await fetch(`${BASE_URL}/v1/uploads/presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      const presignedData = await presignedResponse.json();

      const confirmResponse = await fetch(`${BASE_URL}/v1/uploads/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: presignedData.key,
          originalFileName: "delete-test.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
        }),
      });

      const confirmData = await confirmResponse.json();
      uploadId = confirmData.id;
    });

    it("deve deletar upload com sucesso", async () => {
      const response = await fetch(`${BASE_URL}/v1/uploads/${uploadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();

      // Verificar se foi removido do banco de dados
      const testDb = (globalThis as any).testDb;
      const upload = await testDb.upload.findUnique({
        where: { id: uploadId },
      });

      expect(upload).toBeNull();
    });

    it("deve rejeitar delete sem autenticação", async () => {
      const response = await fetch(`${BASE_URL}/v1/uploads/${uploadId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });

    it("deve rejeitar delete de upload inexistente", async () => {
      const response = await fetch(`${BASE_URL}/v1/uploads/nonexistent-id`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it("deve rejeitar delete de upload de outro usuário", async () => {
      // Criar outro usuário
      const newUser = {
        name: "Another User",
        email: `anotheruser-test-${Date.now()}@example.com`,
        password: "password123",
      };

      const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const signupData = await signupResponse.json();
      const otherUserToken = signupData.token;

      const response = await fetch(`${BASE_URL}/v1/uploads/${uploadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${otherUserToken}`,
        },
      });

      expect(response.status).toBe(400);
    });
  });
});