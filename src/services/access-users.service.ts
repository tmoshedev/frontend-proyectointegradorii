import { AccessUser } from '../models';
import { AccessUserResponse } from '../models/responses';
import apiInstance from './api';
import { DataTable } from "../models";

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

export const updateAccessUser = async (user: AccessUser) => {
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




export const getRoles = async (page: number, text: string, limit: string) => {
  const response = await apiInstance.get<DataTable>(
    `access-users/roles?page=${page}&text=${text}&limit=${limit}`,
  );
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
