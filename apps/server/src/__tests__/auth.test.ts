const BASE_URL = 'http://localhost:4000';

describe('Fluxo de Autenticação', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /v1/auth/signup', () => {
    it('deve criar um novo usuário e retornar token', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.token).toBeDefined();
      expect(data.user.id).toBeDefined();

      expect(data.user.passwordHash).toBeUndefined();
    });

    it('deve rejeitar cadastro com email inválido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testUser,
          email: 'invalid-email'
        })
      });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar cadastro com email duplicado', async () => {
      // First 
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      // Second
      const response = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /v1/auth/login', () => {
    beforeEach(async () => {
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.email).toBe(testUser.email);
      expect(data.token).toBeDefined();
    });

    it('deve rejeitar login com email inválido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
      });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar login com senha inválida', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      const signupResponse = await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const signupData = await signupResponse.json();
      authToken = signupData.token;
    });

    it('deve retornar dados do usuário com token válido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' 
        }
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.email).toBe(testUser.email);
    });

    it('deve rejeitar requisição sem token', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar requisição com token inválido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json' 
        }
      });

      expect(response.status).toBe(401);
    });
  });
});