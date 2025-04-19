/* eslint-disable @typescript-eslint/no-explicit-any */
import apiInstance from './api';
/**Models */
import { Login } from '../models';
import { LoginResponse } from '../models/responses';

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

export const login = async (login: Login) => {
  const response = await apiInstance.post<LoginResponse>('/auth/login', login);
  return response;
};

export const logout = async () => {
  await apiInstance.get('/auth/logout');
};

export const changePassword = async (formData: any) => {
  const response = await apiInstance.patch('/auth/change-password', formData);

  return response;
};
