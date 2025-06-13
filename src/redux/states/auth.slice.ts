import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../models';

interface AuthState {
  user: User | null;
  token: string | null;
  title_sidebar: string | null;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  title_sidebar: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      const roleCodes = action.payload.roles.map((role) => role.code);
      const rolActual = localStorage.getItem('rolActual');
      if (rolActual === null) {
        localStorage.setItem('rolActual', roleCodes[0]);
        localStorage.setItem('rolActualName', action.payload.roles[0].name);
      } else {
        // Verifica si el rolActual sigue existiendo en los roles del usuario
        if (!roleCodes.includes(rolActual)) {
          localStorage.setItem('rolActual', roleCodes[0]);
          localStorage.setItem('rolActualName', action.payload.roles[0].name);
        }
      }
      localStorage.setItem('roles', JSON.stringify(roleCodes));
      localStorage.setItem('permissions', action.payload.permissions.join(','));
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.title_sidebar = '';
      localStorage.removeItem('user');
      localStorage.clear();
    },
    setTitleSidebar: (state, action: PayloadAction<string | null>) => {
      state.title_sidebar = action.payload;
    },
  },
});

export const { setUser, setToken, logout, setTitleSidebar } = authSlice.actions;
export default authSlice.reducer;
