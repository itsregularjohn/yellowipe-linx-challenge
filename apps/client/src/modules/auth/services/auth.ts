import type {
  LoginInput,
  LoginResponse,
  SignupInput,
  SignupResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  SendVerificationEmailInput,
  SendVerificationEmailResponse,
  VerifyEmailInput,
  VerifyEmailResponse,
  UpdateEmailInput,
  UpdateEmailResponse,
  UpdatePasswordInput,
  UpdatePasswordResponse,
  User,
} from '@yellowipe/schemas';
import { AUTH_STORAGE_KEY } from '../../../constants';
import { apiRequest } from '../../core';

export const authApi = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async signup(input: SignupInput): Promise<SignupResponse> {
    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async me(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResponse> {
    return apiRequest<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async sendVerificationEmail(input: SendVerificationEmailInput): Promise<SendVerificationEmailResponse> {
    return apiRequest<SendVerificationEmailResponse>('/auth/send-verification-email', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResponse> {
    return apiRequest<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateEmail(input: UpdateEmailInput): Promise<UpdateEmailResponse> {
    return apiRequest<UpdateEmailResponse>('/auth/update-email', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updatePassword(input: UpdatePasswordInput): Promise<UpdatePasswordResponse> {
    return apiRequest<UpdatePasswordResponse>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};