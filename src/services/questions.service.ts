import apiInstance from './api';

export const storeQuestion = async (type_question_id:string, question: string, question_category_id: string, options: any, order: number) => {
  const form = {
    type_question_id,
    question,
    question_category_id,
    options, // para preguntas de opcion multiple
    order
  };
  const response = await apiInstance.post(`/questions`, {
    question: form,
  });
  return response;
};

export const updateQuestion = async (id: number, type_question_id:string, question: string, options: any, order: number) => {
  const form = {
    type_question_id,
    question,
    options,
    order
  };
  const response = await apiInstance.patch(`/questions/${id}`, {
    question: form,
  });
  return response;
};

export const deleteQuestion = async (id: number) => {
  const response = await apiInstance.delete(`/questions/${id}`);
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
  order: string,
  include: string = ''
) => {
  let url = `/questions?question_category_id=${question_category_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
  if (include) {
    url += `&include=${include}`;
  }
  const response = await apiInstance.get(url);
  return response;
};
