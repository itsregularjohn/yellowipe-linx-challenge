import { PrismaClient } from '../generated/prisma';

const BASE_URL = 'http://localhost:4000';
const testDb = new PrismaClient();

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

  describe('POST /v1/auth/forgot-password', () => {
    beforeEach(async () => {
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
    });

    it('deve criar código de recuperação e retornar mensagem genérica', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('password reset link has been sent');

      // Verificar se código foi criado no banco de dados
      const verificationCode = await testDb.verificationCode.findFirst({
        where: {
          email: testUser.email,
          type: 'password_reset'
        }
      });

      expect(verificationCode).toBeDefined();
      expect(verificationCode?.expiresAt).toBeInstanceOf(Date);
    });

    it('deve retornar mesma mensagem para email inexistente (sem criar código)', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testnonexistent@example.com'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('password reset link has been sent');

      // Verificar que NENHUM código foi criado para email inexistente
      const verificationCode = await testDb.verificationCode.findFirst({
        where: {
          email: 'testnonexistent@example.com',
          type: 'password_reset'
        }
      });

      expect(verificationCode).toBeNull();
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    let passwordResetCode: string;

    beforeEach(async () => {
      // Criar usuário
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      // Solicitar recuperação de senha para gerar código
      await fetch(`${BASE_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email })
      });

      // Buscar o código no banco de dados
      const verificationCode = await testDb.verificationCode.findFirst({
        where: {
          email: testUser.email,
          type: 'password_reset'
        }
      });

      passwordResetCode = verificationCode?.code || '';
    });

    it('deve redefinir senha com código válido', async () => {
      const newPassword = 'newpassword123';
      
      const response = await fetch(`${BASE_URL}/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: passwordResetCode,
          newPassword
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Password reset successfully');

      // Verificar se consegue fazer login com a nova senha
      const loginResponse = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: newPassword
        })
      });

      expect(loginResponse.status).toBe(200);
    });

    it('deve rejeitar código inválido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'codigo-invalido',
          newPassword: 'newpassword123'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    beforeEach(async () => {
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
    });

    it('deve criar código de verificação para email existente', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Verification email sent successfully');

      // Verificar se código foi criado no banco de dados
      const verificationCode = await testDb.verificationCode.findFirst({
        where: {
          email: testUser.email,
          type: 'email_verification'
        }
      });

      expect(verificationCode).toBeDefined();
      expect(verificationCode?.expiresAt).toBeInstanceOf(Date);
    });

    it('deve rejeitar email não encontrado', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testnonexistent@example.com'
        })
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    let verificationCode: string;

    beforeEach(async () => {
      // Criar usuário
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      // Solicitar email de verificação
      await fetch(`${BASE_URL}/v1/auth/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email })
      });

      // Buscar o código no banco de dados
      const code = await testDb.verificationCode.findFirst({
        where: {
          email: testUser.email,
          type: 'email_verification'
        }
      });

      verificationCode = code?.code || '';
    });

    it('deve verificar email com código válido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Email verified successfully');

      // Verificar se usuário foi marcado como verificado no banco
      const user = await testDb.user.findUnique({
        where: { email: testUser.email }
      });

      expect(user?.emailVerified).toBe(true);
    });

    it('deve rejeitar código inválido', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'codigo-invalido'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/auth/update-email', () => {
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

    it('deve atualizar email e marcar como não verificado', async () => {
      const newEmail = 'testnewemail@example.com';
      
      const response = await fetch(`${BASE_URL}/v1/auth/update-email`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          newEmail
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Email updated successfully');

      // Verificar se email foi atualizado e marcado como não verificado
      const user = await testDb.user.findUnique({
        where: { email: newEmail }
      });

      expect(user).toBeDefined();
      expect(user?.emailVerified).toBe(false);
    });

    it('deve rejeitar email já em uso', async () => {
      const existingEmail = 'testexisting@example.com';
      
      // Criar outro usuário com email existente
      await fetch(`${BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testUser,
          email: existingEmail
        })
      });

      const response = await fetch(`${BASE_URL}/v1/auth/update-email`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          newEmail: existingEmail
        })
      });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /v1/auth/update-password', () => {
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

    it('deve atualizar senha com senha atual válida', async () => {
      const newPassword = 'newpassword123';
      
      const response = await fetch(`${BASE_URL}/v1/auth/update-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          currentPassword: testUser.password,
          newPassword
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Password updated successfully');

      // Verificar se consegue fazer login com a nova senha
      const loginResponse = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: newPassword
        })
      });

      expect(loginResponse.status).toBe(200);
    });

    it('deve rejeitar senha atual incorreta', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/update-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          currentPassword: 'senhaerrada',
          newPassword: 'newpassword123'
        })
      });

      expect(response.status).toBe(400);
    });
  });
});