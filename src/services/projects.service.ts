import apiInstance from './api';

export const storeProject = async (type_project_id: string, name: string, image: string) => {
  const form = {
    type_project_id,
    name,
    image,
  };
  const response = await apiInstance.post(`/projects`, {
    project: form,
  });
  return response;
};

export const updateProject = async (id: number, name: string, image: string) => {
  const form = {
    name,
    image,
  };
  const response = await apiInstance.patch(`/projects/${id}`, {
    project: form,
  });
  return response;
};

export const deleteProject = async (id: number) => {
  const response = await apiInstance.delete(`/projects/${id}`);
  return response;
};

export const stateProject = async (id: number) => {
  const response = await apiInstance.patch(`/projects/${id}/state`, {
    project: { id },
  });
  return response;
};

export const getProjects = async (
  type_project_id: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/projects?type_project_id=${type_project_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
