/* eslint-disable @typescript-eslint/no-explicit-any */
import apiInstance from './api';
/**Models */
import { Login } from '../models';
import { LoginResponse } from '../models/responses';

interface ResendResponse {
  message: string;
}

interface ChangeEmailResponse {
  message: string;
  new_email: string;
}

export interface PasswordCodeRequestPayload {
  channel: 'primary_email' | 'phone' | 'alternate_email';
  alternate_email?: string;
}

export interface PasswordCodeResponse {
  message: string;
  masked_destination?: string;
  destination_mask?: string;
  challenge_id: string;
  expires_in: number;
}

export interface ChangePasswordPayload {
  challenge_id: string;
  code: string;
  password_current: string;
  password: string;
  password_confirmation: string;
  logout_others?: boolean;
}

const MAX_REFRESH_ATTEMPTS = 1;

export const checkAuth = async (refreshAttempts = 0): Promise<LoginResponse | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null; // 🔥 Si no hay token, el usuario no está autenticado

  try {
    const response = await apiInstance.get<LoginResponse>('/auth/check-auth');
    return response; // 🔥 Devuelve la respuesta si el usuario está autenticado
  } catch (error: any) {
    console.error('❌ Error en checkAuth:', error);

    // 🔹 Intentar renovar el token si ha expirado
    if (error.response?.status === 401 && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      const newToken = await apiInstance.refreshToken();
      if (newToken) {
        return checkAuth(refreshAttempts + 1); // 🔄 Volver a llamar después de renovar el token
      }
    }

    return null; // 🔥 Si el token no se pudo renovar, el usuario no está autenticado
  }
};

export const login = async (login: Login, captcha: string) => {
  const response = await apiInstance.post<LoginResponse>('/auth/login', { ...login, captcha });
  return response;
};

export const verifyTwoFactor = async (userId: number, code: string) => {
  const response = await apiInstance.post<LoginResponse>('/auth/verify-2fa', { userId, code });
  return response;
};

export const resendTwoFactor = async (userId: number) => {
  const response = await apiInstance.post<ResendResponse>('/auth/resend-2fa', { userId });
  return response;
};

export const changeEmailAndResendTwoFactor = async (userId: number, new_email: string) => {
  const response = await apiInstance.post<ChangeEmailResponse>('/auth/change-email-2fa', { userId, new_email });
  return response;
};

export const requestPasswordChangeCode = async (payload: PasswordCodeRequestPayload) => {
  const response = await apiInstance.post<PasswordCodeResponse>(
    '/auth/change-password/request-code',
    payload
  );
  return response;
};

export const logout = async () => {
  await apiInstance.get('/auth/logout');
};

export const changePassword = async (formData: ChangePasswordPayload) => {
  const response = await apiInstance.patch('/auth/change-password', formData);

  return response;
};
