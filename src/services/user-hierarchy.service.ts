import { AccessUser } from '../models';
import { TableCrmResponse } from '../models/responses';
import apiInstance from './api';

export const getUserHierarchy = async (text: string, limit: number, page: number) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<TableCrmResponse>(
    `/user-hierarchy?rolActual=${rolActual}&text=${text}&limit=${limit}&page=${page}`
  );
  return response;
};

export const requirements = async () => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get('/user-hierarchy/requirements?rolActual=' + rolActual);
  return response;
};

export const storeUserHierarchy = async (data: AccessUser) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post(`/user-hierarchy?rolActual=${rolActual}`, {
    user_hierarchy: data,
  });
  return response;
};

export const deleteUserHierarchy = async (user_hierarchy_id: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.delete(
    `/user-hierarchy/${user_hierarchy_id}?rolActual=${rolActual}`
  );
  return response;
};

export const postHabilitarUserHierarchy = async (user_hierarchy_id: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post(`/user-hierarchy/habilitar?rolActual=${rolActual}`, {
    user_hierarchy_id: user_hierarchy_id,
  });
  return response;
};
