import { useDispatch } from 'react-redux';
/** Services */
import * as AnswerService from '../services/answers.service';
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
import { Answer } from '../models';

export function useAnswers() {
  const dispatch = useDispatch();

  const getAnswer = async (
    lead_id: string,
    text: string,
    type: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    loading: boolean,
    updateTable: boolean = false
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await AnswerService.getAnswer(
        lead_id,
        text,
        type,
        page,
        limit,
        orderBy,
        order,
        
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
  const storeAnswer = async (question_id: string, lead_id: string, user_id: string, respuesta: string) => {
    dispatch(setLoading(true));
    try {
      const response = await AnswerService.storeAnswer(
        question_id,
        lead_id,
        user_id,
        respuesta
      );
      const typedResponse = response as { answer: Answer };
      dispatch(dataTable_addResource(typedResponse.answer));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateAnswer = async (id: number, respuesta: string) => {
    dispatch(setLoading(true));
    try {
      const response = await AnswerService.updateAnswer(
        id,
        respuesta
      );
      const typedResponse = response as { answer: Answer };
      dispatch(dataTable_updateResource(typedResponse.answer));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteAnswer = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await AnswerService.deleteAnswer(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateAnswer = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await AnswerService.stateAnswer(id);
      const typedResponse = response as { answer: Answer };
      dispatch(dataTable_updateResource(typedResponse.answer));
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
    getAnswer,
    storeAnswer,
    updateAnswer,
    deleteAnswer,
    stateAnswer,
  };
}
