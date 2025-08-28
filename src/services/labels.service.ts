import apiInstance from './api';

export const storeLabel = async (type_label_id: string, name: string, color: string) => {
  const form = {
    type_label_id,
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
  type_label_id: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/labels?type_label_id=${type_label_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
