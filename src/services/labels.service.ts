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
