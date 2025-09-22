import apiInstance from './api';

export const storeAnswer = async (question_id: number, lead_id: number, user_id: number, respuesta: string) => {
  const form = {
  question_id,
  lead_id,
  user_id,
  respuesta
  };
  const response = await apiInstance.post(`/answers`, {
    answer: form,
  });
  return response;
};

export const updateAnswer = async (id: number, question_id: number, lead_id: number, user_id: number, respuesta: string) => {
  const form = {
    question_id,
    lead_id,
    user_id,
    respuesta
  };
  const response = await apiInstance.patch(`/answers/${id}`, {
    answer: form,
  });
  return response;
};

export const deleteAnswer = async (id: number) => {
  const response = await apiInstance.delete(`/answers/${id}`);
  return response;
};

export const stateAnswer = async (id: number) => {
  const response = await apiInstance.patch(`/answers/${id}/state`, {
    answer: { id },
  });
  return response;
};

export const getAnswer = async (
lead_id: string,
text: string, 
type: string,  
page: number, 
limit: string, 
orderBy: string, 
order: string, 
) => {
  const response = await apiInstance.get(
    `/answers?lead_id=${lead_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};
