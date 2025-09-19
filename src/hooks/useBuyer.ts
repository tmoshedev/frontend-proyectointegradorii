import { useState } from 'react';
import {
  getQuestionCategories,
  createQuestionCategory,
  updateQuestionCategory,
  deleteQuestionCategory,
  getTypeQuestions,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAnswers,
  saveAnswers,
} from '../services/buyer.service';
import { QuestionCategory, TypeQuestion, Question, Answer } from '../models';

export const useBuyer = () => {
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
  const [typeQuestions, setTypeQuestions] = useState<TypeQuestion[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchQuestionCategories = async () => {
    setLoading(true);
    try {
      const response = await getQuestionCategories();
      setQuestionCategories(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestionCategory = async (category: Partial<QuestionCategory>) => {
    setLoading(true);
    try {
      const response = await createQuestionCategory(category);
      setQuestionCategories([...questionCategories, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const editQuestionCategory = async (id: number, category: Partial<QuestionCategory>) => {
    setLoading(true);
    try {
      const response = await updateQuestionCategory(id, category);
      setQuestionCategories(
        questionCategories.map((c) => (c.id === id ? response.data : c))
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeQuestionCategory = async (id: number) => {
    setLoading(true);
    try {
      await deleteQuestionCategory(id);
      setQuestionCategories(questionCategories.filter((c) => c.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTypeQuestions = async () => {
    setLoading(true);
    try {
      const response = await getTypeQuestions();
      setTypeQuestions(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getQuestions();
      setQuestions(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (question: Partial<Question>) => {
    setLoading(true);
    try {
      const response = await createQuestion(question);
      setQuestions([...questions, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const editQuestion = async (id: number, question: Partial<Question>) => {
    setLoading(true);
    try {
      const response = await updateQuestion(id, question);
      setQuestions(questions.map((q) => (q.id === id ? response.data : q)));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (id: number) => {
    setLoading(true);
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (leadId: number) => {
    setLoading(true);
    try {
      const response = await getAnswers(leadId);
      setAnswers(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async (newAnswers: Partial<Answer>[]) => {
    setLoading(true);
    try {
      await saveAnswers(newAnswers);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    questionCategories,
    typeQuestions,
    questions,
    answers,
    loading,
    error,
    fetchQuestionCategories,
    addQuestionCategory,
    editQuestionCategory,
    removeQuestionCategory,
    fetchTypeQuestions,
    fetchQuestions,
    addQuestion,
    editQuestion,
    removeQuestion,
    fetchAnswers,
    submitAnswers,
  };
};
