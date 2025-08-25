import apiInstance from './api';

export const storeLabel = async (name: string, color: string) => {
  const form = {
    name,
    color,
  };
  const response = await apiInstance.post(`/labels`, {
    label: form,
  });
  return response;
};

export const updateLabel = async (id: number, name: string, color: string) => {
  const form = {
    name,
    color,
  };
  const response = await apiInstance.patch(`/labels/${id}`, {
    label: form,
  });
  return response;
};

export const deleteLabel = async (id: number) => {
  const response = await apiInstance.delete(`/labels/${id}`);
  return response;
};

export const stateLabel = async (id: number) => {
  const response = await apiInstance.patch(`/labels/${id}/state`, {
    label: { id },
  });
  return response;
};

export const getLabels = async (
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/labels?text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
