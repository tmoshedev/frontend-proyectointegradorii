/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  login as loginService,
  logout,
  changePassword,
  verifyTwoFactor as verifyTwoFactorService,
  resendTwoFactor as resendTwoFactorService,
  changeEmailAndResendTwoFactor as changeEmailAndResendTwoFactorService,
} from '../services/auth.service';
import { setUser, setToken } from '../redux/states/auth.slice';
import { SweetAlert } from '../utilities';
import { Login } from '../models';
/** Redux */
import { setLoading } from '../redux/states/loading.slice';
import { logout as logoutRedux } from '../redux/states/auth.slice';

/** Hook para manejar la lógica de autenticación */
export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /** Función para manejar el login */
  const login = async (credentials: Login, captcha: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const response = await loginService(credentials, captcha);

      // Corregido para coincidir con tu backend: `2fa_required` y `userId`
      if (response['2fa_required']) {
        SweetAlert.info('Verificación Requerida', response.message);
        navigate('/verify-2fa', { state: { userId: response.userId } });
        return true; // Se considera un "éxito" parcial para no mostrar error
      }

      const { access_token, refresh_token, user } = response;

      // Guardar tokens en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      const roleCodes = user.roles.map((role: any) => role.code);
      localStorage.setItem('roles', JSON.stringify(roleCodes));
      localStorage.setItem('permissions', user.permissions.join(','));

      // Guardar usuario en Redux
      dispatch(setUser(user));
      dispatch(setToken(access_token));

      navigate('/');
      return true; // Login completo exitoso
    } catch (error: any) {
      if (error.response?.status === 401) {
        SweetAlert.error('Error de autenticación', error.response.data.message);
      } else {
        SweetAlert.error('Error de autenticación', 'Ocurrió un problema inesperado.');
      }
      return false; // Error en el login
    } finally {
      dispatch(setLoading(false));
    }
  };

  const verifyTwoFactor = async (userId: number, code: string) => {
    dispatch(setLoading(true));
    try {
      const response = await verifyTwoFactorService(userId, code);
      const { access_token, refresh_token, user } = response;

      // Guardar tokens en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      const roleCodes = user.roles.map((role: any) => role.code);
      localStorage.setItem('roles', JSON.stringify(roleCodes));
      localStorage.setItem('permissions', user.permissions.join(','));

      // Guardar usuario en Redux
      dispatch(setUser(user));
      dispatch(setToken(access_token));

      return true;
    } catch (error: any) {
      SweetAlert.error('Error', error.response?.data?.message || 'Código de verificación incorrecto.');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(setLoading(true));
    logout()
      .then(() => {
        localStorage.clear();
        dispatch(logoutRedux()); // 🔥 Borra el token de Redux
        navigate('/login');
      })
      .catch((error: any) => error)
      .finally(() => dispatch(setLoading(false)));
  };

  const changePasswordHook = async (formData: any) => {
    dispatch(setLoading(true));
    try {
      const response = await changePassword(formData).then(() => {
        SweetAlert.success('Contraseña actualizada correctamente.');
        handleLogout();
      });
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResendTwoFactor = async (userId: number) => {
    dispatch(setLoading(true));
    try {
      const response = await resendTwoFactorService(userId);
      SweetAlert.success('Éxito', response.message);
      return true;
    } catch (error: any) {
      SweetAlert.error('Error', error.response?.data?.message || 'No se pudo reenviar el código.');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChangeEmailAndResend = async (userId: number, newEmail: string) => {
    dispatch(setLoading(true));
    try {
      const response = await changeEmailAndResendTwoFactorService(userId, newEmail);
      SweetAlert.success('Éxito', response.message);
      return { success: true, newEmail: response.new_email };
    } catch (error: any) {
      SweetAlert.error('Error', error.response?.data?.message || 'No se pudo cambiar el correo.');
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    login,
    handleLogout,
    changePassword: changePasswordHook,
    verifyTwoFactor,
    resendTwoFactor: handleResendTwoFactor,
    changeEmailAndResend: handleChangeEmailAndResend,
  };
};
