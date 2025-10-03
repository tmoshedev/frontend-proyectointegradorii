import { AccessUser } from '../models';
import { AccessUserResponse } from '../models/responses';
import apiInstance from './api';

export const getAccessUsers = async (
  role_id: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/access-users?role_id=${role_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
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
