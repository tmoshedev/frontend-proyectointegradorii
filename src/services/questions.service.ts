import apiInstance from './api';

export const storeQuestion = async (type_question_id:string, texto: string, question_category_id: string, opciones: any, orden: number) => {
  const form = {
    type_question_id,
    texto,
    question_category_id,
    opciones, // para preguntas de opcion multiple
    orden
  };
  const response = await apiInstance.post(`/questions`, {
    question: form,
  });
  return response;
};

export const updateQuestion = async (id: number, name: string, orden: number) => {
  const form = {
    name,
    orden,
  };
  const response = await apiInstance.patch(`/questions/${id}`, {
    question: form,
  });
  return response;
};

export const deleteQuestion = async (id: number) => {
  const response = await apiInstance.delete(`/question-categories/${id}`);
  return response;
};

export const stateQuestion = async (id: number) => {
  const response = await apiInstance.patch(`/questions/${id}/state`, {
    question: { id },
  });
  return response;
};

export const getQuestion = async (
  question_category_id: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/questions?question_category_id=${question_category_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
