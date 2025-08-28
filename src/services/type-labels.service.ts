import apiInstance from './api';

export const storeTypeLabel = async (name: string) => {
  const form = {
    name,
  };
  const response = await apiInstance.post(`/type-labels`, {
    type_label: form,
  });
  return response;
};

export const updateTypeLabel = async (id: number, name: string) => {
  const form = {
    name,
  };
  const response = await apiInstance.patch(`/type-labels/${id}`, {
    type_label: form,
  });
  return response;
};

export const deleteTypeLabel = async (id: number) => {
  const response = await apiInstance.delete(`/type-labels/${id}`);
  return response;
};

export const stateTypeLabel = async (id: number) => {
  const response = await apiInstance.patch(`/type-labels/${id}/state`, {
    typelabel: { id },
  });
  return response;
};

export const getTypeLabels = async (
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/type-labels?text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
