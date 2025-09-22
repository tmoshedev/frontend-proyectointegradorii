import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Answer, Question, QuestionCategory } from '../models';
import { AppStore } from '../redux/store';
import { getQuestionCategory } from '../services/question-categories.service';
import { getQuestion } from '../services/questions.service';
import { getAnswer, storeAnswer } from '../services/answers.service';
import { SweetAlert } from '../utilities';
import { User } from '../models/user.model';

export const useBuyerForm = (lead_id: string) => {
  // --- Redux State ---
  const user = useSelector((store: AppStore) => store.user);

  // --- Component State ---
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, Partial<Answer>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setEditing] = useState(false);

  // --- Permissions ---
  // El usuario puede editar si es supervisor o si no hay respuestas y está creando por primera vez.
  const canEdit = user.rol?.name === 'Supervisor' || Object.keys(answers).length === 0;
  const isSupervisor = user.rol?.name === 'Supervisor';

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!lead_id) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [catRes, qRes, ansRes] = await Promise.all([
        getQuestionCategory('', '', 1, '1000', 'orden', 'asc'),
        getQuestion('', '', '', 1, '1000', 'orden', 'asc'),
        getAnswer(lead_id, '', '', 1, '1000', 'created_at', 'asc'),
      ]);

      const categoriesData = (catRes as { data: QuestionCategory[] }).data || [];
      const questionsData = (qRes as { data: Question[] }).data || [];
      const answersData = (ansRes as { data: Answer[] }).data || [];

      setCategories(categoriesData);
      setQuestions(questionsData);

      // Map existing answers to a more accessible format
      if (answersData.length > 0) {
        const newAnswers: Record<number, Partial<Answer>> = {};
        answersData.forEach(ans => {
          if (ans.question_id) {
            newAnswers[ans.question_id] = ans;
          }
        });
        setAnswers(newAnswers);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del formulario.');
      SweetAlert.error("Error", "No se pudieron cargar los datos del formulario.");
    } finally {
      setLoading(false);
    }
  }, [lead_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleAnswerChange = (questionId: number, respuesta: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        lead_id: Number(lead_id),
        user_id: (user as User).id,
        respuesta: respuesta,
      },
    }));
  };

  const submitAnswers = async () => {
    const answersToSave = Object.values(answers).filter(a => a.respuesta !== undefined && a.respuesta !== null && a.respuesta !== '');
    if (answersToSave.length === 0) {
      SweetAlert.info('Información', 'No hay respuestas nuevas para guardar.');
      return;
    }
    try {
      for (const ans of answersToSave) {
        await storeAnswer(
          ans.question_id as number,
          ans.lead_id as number,
          ans.user_id as number,
          ans.respuesta ?? ''
        );
      }
      SweetAlert.success('Éxito', 'Respuestas guardadas correctamente.');
      setEditing(false); // Bloquear el formulario después de guardar
      fetchData(); // Recargar datos
    } catch (error) {
      SweetAlert.error('Error', 'No se pudieron guardar las respuestas.');
    }
  };

  const toggleEditMode = () => {
    if (isSupervisor) {
      setEditing(!isEditing);
    }
  };

  return {
    loading,
    error,
    categories,
    questions,
    answers,
    canEdit,
    isSupervisor,
    isEditing,
    handleAnswerChange,
    submitAnswers,
    toggleEditMode,
  };
};