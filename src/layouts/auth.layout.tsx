/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
/** Components */
import { Loading } from '../components/shared';
/** Layouts */
import DefaultLayout from './auth/default.layout';
/** Redux */
import { AppStore } from '../redux/store';
import { setUser } from '../redux/states/auth.slice';
import { checkAuth } from '../services/auth.service';

const AuthLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state: AppStore) => state.auth.user);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: any = await checkAuth();
        if (response && response.user) {
          // Normalizar must_change_password a un booleano estricto
          const processedUser = {
            ...response.user,
            must_change_password: !!response.user.must_change_password,
          };
          dispatch(setUser(processedUser));

          // Guardar UUID para WebSocket
          const identifier = processedUser.uuid || processedUser.id.toString();
          if (identifier) {
            localStorage.setItem('user_uuid', identifier);
          }
        } else {
          console.warn('🔴 Usuario no autenticado. Redirigiendo a /login...');
          navigate('/login');
        }
      } catch (error) {
        console.error('❌ Error en checkAuth:', error);
        navigate('/login');
      } finally {
        setAuthChecked(true);
      }
    };

    if (!authChecked) {
      fetchUser();
    }

      }, [authChecked, dispatch, navigate]);


  if (!authChecked) {
    return <Loading />;
  }

  return userState ? <DefaultLayout /> : null;
};

export default AuthLayout;
