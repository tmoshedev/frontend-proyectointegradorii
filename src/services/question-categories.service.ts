import apiInstance from './api';

export const storeQuestionCategory = async (name: string, order: number) => {
  const form = {
    name,
    order
  };
  const response = await apiInstance.post(`/question-categories`, {
    question_category: form,
  });
  return response;
};

export const updateQuestionCategory = async (id: string, name: string, order: number) => {
  const form = {
    name,
    order,
  };
  const response = await apiInstance.patch(`/question-categories/${id}`, {
    question_category: form,
  });
  return response;
};

export const deleteQuestionCategory = async (id: number) => {
  const response = await apiInstance.delete(`/question-categories/${id}`);
  return response;
};

export const stateQuestionCategory = async (id: number) => {
  const response = await apiInstance.patch(`/question-categories/${id}/state`, {
    question_category: { id },
  });
  return response;
};

export const getQuestionCategory = async (
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string,
) => {
  const response = await apiInstance.get(
    `/question-categories?text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
