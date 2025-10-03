/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  requestPasswordChangeCode,
  changePassword as changePasswordService,
  logout as logoutService,
  PasswordCodeRequestPayload,
  PasswordCodeResponse,
  ChangePasswordPayload,
} from '../services/auth.service';
import { SweetAlert } from '../utilities';
import { setLoading } from '../redux/states/loading.slice';
import { logout as logoutRedux } from '../redux/states/auth.slice';

interface HookResponse<T = unknown> {
  ok: boolean;
  data?: T;
  errors?: any;
}

export const useChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sendVerificationCode = async (
    payload: PasswordCodeRequestPayload
  ): Promise<HookResponse<PasswordCodeResponse>> => {
    dispatch(setLoading(true));
    try {
      const response = await requestPasswordChangeCode(payload);
      SweetAlert.success('Código enviado', response.message);
      return {
        ok: true,
        data: response,
      };
    } catch (error: any) {
      SweetAlert.error('Error', error.response?.data?.message || 'No se pudo enviar el código.');
      return {
        ok: false,
        errors: error.response?.data?.errors,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updatePassword = async (payload: ChangePasswordPayload): Promise<HookResponse> => {
    dispatch(setLoading(true));
    try {
      await changePasswordService(payload);
      SweetAlert.success(
        'Contraseña actualizada',
        'Vuelve a iniciar sesión con tu nueva contraseña.'
      );
      await logoutService();
      localStorage.clear();
      dispatch(logoutRedux());
      navigate('/login');
      return { ok: true };
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar la contraseña.'
      );
      return {
        ok: false,
        errors: error.response?.data?.errors,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    sendVerificationCode,
    updatePassword,
  };
};
