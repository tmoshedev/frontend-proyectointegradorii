/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, logout, changePassword } from '../services/auth.service';
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
  const handleLogin = async (credentials: Login) => {
    dispatch(setLoading(true));
    try {
      const response = await login(credentials); // ✅ No usar .data, ya es un LoginResponse

      const { access_token, refresh_token, user } = response; // ✅ Extraer directamente

      // Guardar tokens en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      const roleCodes = response.user.roles.map((role) => role.code);
      localStorage.setItem('roles', JSON.stringify(roleCodes));
      localStorage.setItem('permissions', response.user.permissions.join(','));

      // Guardar usuario en Redux
      dispatch(setUser(user));
      dispatch(setToken(access_token));

      // Verifica que user.uuid exista, si no, usa user.id
      console.log('UUID del usuario:', user.uuid);
      console.log('ID del usuario:', user.id);
      const identifier = user.uuid || user.id.toString();
      console.log('Identificador usado:', identifier);

      if (identifier) {
        localStorage.setItem('user_uuid', identifier);
      } else {
        console.error('Ni UUID ni ID encontrado en respuesta de login');
      }

      //SweetAlert.success('Inicio de sesión exitoso', 'Bienvenido de nuevo');

      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 401) {
        SweetAlert.error('Error de autenticación', error.response.data.message);
      } else {
        SweetAlert.error('Error de autenticación', 'Ocurrió un problema inesperado.');
      }
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

  return { login: handleLogin, handleLogout, changePassword: changePasswordHook };
};
