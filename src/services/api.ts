/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import store from '../redux/store';
import { setToken, logout } from '../redux/states/auth.slice';
import { SweetAlert } from '../utilities';
import messages from '../resources/messages';

class Api {
  constructor() {
    axios.defaults.baseURL = import.meta.env.VITE_URL_API;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    axios.interceptors.request.use((config) => this.addTokenToRequest(config));

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response) {
          // 🔹 Si el token expira, intenta renovarlo
          //console.log('error.response.status', originalRequest);
          if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
            originalRequest._retry = true;
            const newToken = await this.refreshToken();
            if (newToken) {
              store.dispatch(setToken(newToken));
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              store.dispatch(logout());
              window.location.href = '/login';
            }
          }          

          // ⚠ Manejo de errores específicos
          switch (error.response.status) {
            case 403:
              SweetAlert.warning(
                `Code: ${error.response.data.code}`,
                `Mensaje: ${error.response.data.message}`
              );
              break;
            case 404:
              SweetAlert.error('El servicio no existe:', `Mensaje: ${error.response.data.message}`);
              break;
            case 500:
              SweetAlert.error('Error en el servidor:', `Mensaje: ${error.response.data.message}`);
              break;
          }
        } else if (error.request) {
          // 🔹 No hay respuesta del servidor
          SweetAlert.warning(messages.NOT_CONECTION_CODE, messages.NOT_CONECTION_MESSAGE);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 🔄 Función para renovar el token si ha expirado
   */
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await axios.post(
        '/auth/refresh-token',
        { refreshToken },
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      const newToken = response.data.access_token;
      if (!newToken) throw new Error('No se recibió un nuevo token');

      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('❌ Error al renovar el token:', error);
      return null;
    }
  }

  /**
   * 📌 Agregar el token a cada solicitud
   */
  private addTokenToRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }

  // ✅ Métodos HTTP

  async get<T>(url: string, params: any = {}): Promise<T> {
    const response: AxiosResponse<T> = await axios.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, params: any): Promise<T> {
    const response: AxiosResponse<T> = await axios.post(url, params);
    return response.data;
  }

  async patch<T>(url: string, params: any): Promise<T> {
    const response: AxiosResponse<T> = await axios.patch(url, params);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await axios.delete(url);
    return response.data;
  }

  async postWithFile<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

const apiInstance = new Api();
export default apiInstance;
