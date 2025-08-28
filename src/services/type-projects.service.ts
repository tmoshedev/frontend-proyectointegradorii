import apiInstance from './api';

export const storeTypeProject = async (name: string) => {
  const form = {
    name,
  };
  const response = await apiInstance.post(`/type-projects`, {
    type_project: form,
  });
  return response;
};

export const updateTypeProject = async (id: number, name: string) => {
  const form = {
    name,
  };
  const response = await apiInstance.patch(`/type-projects/${id}`, {
    type_project: form,
  });
  return response;
};

export const deleteTypeProject = async (id: number) => {
  const response = await apiInstance.delete(`/type-projects/${id}`);
  return response;
};

export const stateTypeProject = async (id: number) => {
  const response = await apiInstance.patch(`/type-projects/${id}/state`, {
    type_project: { id },
  });
  return response;
};

export const getTypeProjects = async (
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/type-projects?text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
