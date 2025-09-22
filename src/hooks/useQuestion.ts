import { useDispatch } from 'react-redux';
/** Services */
import * as QuestionService from '../services/questions.service';
/** Redux */
import { setLoading } from '../redux/states/loading.slice';
import {
  dataTable_addResource,
  dataTable_clearAll,
  dataTable_setAlls,
  dataTable_updateResource,
  dataTable_deleteResource,
} from '../redux/states/dataTable.slice';
import { useEffect } from 'react';
import { Question } from '../models';

export function useQuestions() {
  const dispatch = useDispatch();

  const getQuestion = async (
    question_id: string,
    text: string,
    type: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    loading: boolean,
    updateTable: boolean = false,
    include: string = ''
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionService.getQuestion(
        question_id,
        text,
        type,
        page,
        limit,
        orderBy,
        order,
        include
      );

      if (updateTable) {
        dispatch(dataTable_setAlls(response));
      }

      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STORE
  const storeQuestion = async (type_question_id:string, texto: string, question_category_id: string, opciones: any, orden: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionService.storeQuestion(
        type_question_id,
        texto,
        question_category_id,
        opciones,
        orden  
      );
      const typedResponse = response as { question: Question };
      dispatch(dataTable_addResource(typedResponse.question));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateQuestion = async (id: number, name: string, orden: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionService.updateQuestion(
        id,
        name || '',
        orden || 0
      );
      const typedResponse = response as { question: Question };
      dispatch(dataTable_updateResource(typedResponse.question));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteQuestion = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await QuestionService.deleteQuestion(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateQuestion = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionService.stateQuestion(id);
      const typedResponse = response as { question: Question };
      dispatch(dataTable_updateResource(typedResponse.question));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const resetData = () => {
      dispatch(dataTable_clearAll());
    };

    return () => {
      resetData(); // Esto se ejecutará cuando el componente se desmonte
    };
  }, [dispatch]);

  return {
    getQuestion,
    storeQuestion,
    updateQuestion,
    deleteQuestion,
    stateQuestion,
  };
}
