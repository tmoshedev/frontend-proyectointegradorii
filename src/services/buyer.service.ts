import {
  QuestionCategory,
  TypeQuestion,
  Question,
  Answer,
} from '../models';
import axios from 'axios';

const QUESTION_CATEGORIES_URL = '/question-categories';
const TYPE_QUESTIONS_URL = '/type-questions';
const QUESTIONS_URL = '/questions';
const ANSWERS_URL = '/answers';

// Question Categories
export const getQuestionCategories = () => {
  return axios.get<QuestionCategory[]>(QUESTION_CATEGORIES_URL);
};

export const createQuestionCategory = (data: Partial<QuestionCategory>) => {
  return axios.post<QuestionCategory>(QUESTION_CATEGORIES_URL, data);
};

export const updateQuestionCategory = (id: number, data: Partial<QuestionCategory>) => {
  return axios.put<QuestionCategory>(`${QUESTION_CATEGORIES_URL}/${id}`, data);
};

export const deleteQuestionCategory = (id: number) => {
  return axios.delete(`${QUESTION_CATEGORIES_URL}/${id}`);
};

// Type Questions
export const getTypeQuestions = () => {
  return axios.get<TypeQuestion[]>(TYPE_QUESTIONS_URL);
};

// Questions
export const getQuestions = () => {
  return axios.get<Question[]>(QUESTIONS_URL);
};

export const createQuestion = (data: Partial<Question>) => {
  return axios.post<Question>(QUESTIONS_URL, data);
};

export const updateQuestion = (id: number, data: Partial<Question>) => {
  return axios.put<Question>(`${QUESTIONS_URL}/${id}`, data);
};

export const deleteQuestion = (id: number) => {
  return axios.delete(`${QUESTIONS_URL}/${id}`);
};

// Answers
export const getAnswers = (leadId: number) => {
  return axios.get<Answer[]>(`${ANSWERS_URL}?lead_id=${leadId}`);
};

export const saveAnswers = (data: Partial<Answer>[]) => {
  return axios.post(ANSWERS_URL, { answers: data });
};
