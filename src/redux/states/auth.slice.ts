import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../models';
import { isRoleActive } from '../../utilities/role.utils';

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

const toArray = (source: any): any[] => {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.data)) {
    return source.data;
  }

  return [];
};

const normalizePermissionValues = (entries: any[]): string[] => {
  const collected: string[] = [];

  entries.forEach((entry) => {
    if (entry === null || entry === undefined) {
      return;
    }

    if (typeof entry === 'string' || typeof entry === 'number') {
      const value = String(entry).trim();
      if (value) {
        collected.push(value);
      }
      return;
    }

    if (typeof entry === 'object') {
      const candidate = entry.name ?? entry.permission ?? entry.slug ?? entry.code ?? entry.id;
      if (candidate !== undefined && candidate !== null) {
        const value = String(candidate).trim();
        if (value) {
          collected.push(value);
        }
      }
    }
  });

  return Array.from(new Set(collected));
};

const extractPermissionsFromRole = (role: any): string[] => {
  if (!role) {
    return [];
  }

  const sources = [
    role.permissions,
    role.permission_names,
    role.permission_list,
    role.permissions_detail,
  ];

  for (const source of sources) {
    const normalized = normalizePermissionValues(toArray(source));
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [];
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const payload = action.payload;

      const rolesDetailSource = payload.roles_detail ?? payload.roles;
      const rolesToPersist = (rolesDetailSource ?? []).filter((role: any) =>
        isRoleActive(role?.state)
      );
      const roleCodes = rolesToPersist.map((role: any) => role.code);
      let rolActual = localStorage.getItem('rolActual');

      if (roleCodes.length > 0) {
        const roleNames = rolesToPersist.map((role: any) => role.name);
        const defaultCode = roleCodes[0];
        const defaultName = roleNames[0];

        if (!rolActual || !roleCodes.includes(rolActual)) {
          rolActual = defaultCode;
          localStorage.setItem('rolActual', defaultCode);
          localStorage.setItem('rolActualName', defaultName);
        } else {
          const currentIndex = roleCodes.indexOf(rolActual);
          const currentName = roleNames[currentIndex] ?? defaultName;
          localStorage.setItem('rolActualName', currentName);
        }
      } else {
        rolActual = null;
        localStorage.removeItem('rolActual');
        localStorage.removeItem('rolActualName');
      }

      const selectedRole = rolActual
        ? rolesToPersist.find((role: any) => role.code === rolActual)
        : undefined;

      const permissionsFromRole = extractPermissionsFromRole(selectedRole);
      const normalizedPayloadPermissions = normalizePermissionValues(
        toArray(payload.permissions ?? [])
      );

      let effectivePermissions =
        permissionsFromRole.length > 0 ? permissionsFromRole : normalizedPayloadPermissions;

      if (roleCodes.length === 0) {
        effectivePermissions = [];
      }

      const enrichedUser: User = {
        ...payload,
        roles: rolesToPersist,
        permissions: effectivePermissions,
        pendingRoleAssignment: roleCodes.length === 0,
      };

      state.user = enrichedUser;

      localStorage.setItem('roles', JSON.stringify(roleCodes));
      localStorage.setItem('permissions', effectivePermissions.join(','));
      localStorage.setItem('user', JSON.stringify(enrichedUser));
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
