import { AccessUser } from '../models';
import { AccessUserResponse } from '../models/responses';
import apiInstance from './api';
import { DataTable } from "../models";
import { Role } from '../models';

export const getAccessUsers = async (
  role_id: string,
  state: string,
  user_uuid: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/access-users?role_id=${role_id}&state=${state}&user_uuid=${user_uuid}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};

export const storeAccessUser = async (user: AccessUser) => {
  const response = await apiInstance.post<AccessUserResponse>('/access-users', {
    user,
  });
  return response;
};

export const updateAccessUser = async (user: Partial<AccessUser>) => {
  const response = await apiInstance.patch<AccessUserResponse>(`/access-users`, {
    user,
  });
  return response;
};

export const stateAccessUser = async (user: AccessUser) => {
  const response = await apiInstance.patch<AccessUserResponse>(`/access-users/state`, {
    user: {
      id: user,
    },
  });
  return response;
};

export const resetPasswordAccessUser = async (user: AccessUser) => {
  const response = await apiInstance.patch<AccessUserResponse>(`/access-users/reset-password`, {
    user: {
      id: user,
    },
  });
  return response;
};

export const getRequirements = async () => {
  const response = await apiInstance.get(`/access-users/requirements`);
  return response;
};

export const getRoles = async (
  page: number,
  text: string,
  limit: string,
  includeInactive: boolean = true,
) => {
  const includeInactiveFlag = includeInactive ? 1 : 0;
  const response = await apiInstance.get<DataTable>(
    `/access-users/roles?page=${page}&text=${text}&limit=${limit}&include_inactive=${includeInactiveFlag}`,
  );
  return response;
};

export const storeRole = async (role: Role) => {
  const response = await apiInstance.post('/access-users/roles', role);
  return response;
};

export const updateRoleState = async (roleId: number, state: boolean) => {
  const response = await apiInstance.patch(`/access-users/roles/${roleId}/state`, {
    state,
  });
  return response;
};

export const permissionsNotAssign = async (role_id: string) => {
  const response = await apiInstance.get(`/access-users/roles/${role_id}/permissions-not-assign`);
  return response;
};

export const permissionsAssign = async (role_id: string) => {
  const response = await apiInstance.get(`/access-users/roles/${role_id}/permissions`);
  return response;
};

export const updatePermissions = async (role_id: string, permissions: string[], type: string) => {
  const response = await apiInstance.patch(`/access-users/roles/${role_id}/permissions`, {
    permissions: {
      permissions: permissions,
      type: type,
    },
  });
  return response;
};


interface ContactVerificationResponse {
  message: string;
  expires_in: number;
  verification_id: string;
}

interface ContactVerificationConfirmResponse {
  message: string;
  verified: boolean;
}

type ContactVerificationType = 'email' | 'cellphone';

export const sendContactVerificationCode = async (
  type: ContactVerificationType,
  value: string
) => {
  const response = await apiInstance.post<ContactVerificationResponse>(
    '/access-users/contact/send-code',
    {
      type,
      value,
    }
  );
  return response;
};

export const verifyContactVerificationCode = async (
  type: ContactVerificationType,
  value: string,
  code: string,
  verification_id: string
) => {
  const response = await apiInstance.post<ContactVerificationConfirmResponse>(
    '/access-users/contact/verify-code',
    {
      type,
      value,
      code,
      verification_id,
    }
  );
  return response;
};
