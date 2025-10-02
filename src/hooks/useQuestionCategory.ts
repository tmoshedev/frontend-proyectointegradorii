import { useDispatch } from 'react-redux';
/** Services */
import * as QuestionCategoryService from '../services/question-categories.service';
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
import { QuestionCategory } from '../models';

export function useQuestionCategories() {
  const dispatch = useDispatch();

  const getQuestionCategory = async (
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
      const response = await QuestionCategoryService.getQuestionCategory(
        text,
        type,
        page,
        limit,
        orderBy,
        order
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
  const storeQuestionCategory = async (name: string, order: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionCategoryService.storeQuestionCategory(
        name || '',
        order || 0,
      );
      const typedResponse = response as { question_category: QuestionCategory };
      dispatch(dataTable_addResource(typedResponse.question_category));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateQuestionCategory = async (id: string, name: string, order: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionCategoryService.updateQuestionCategory(
        id,
        name || '',
        order || 0
      );
      const typedResponse = response as { question_category: QuestionCategory };
      dispatch(dataTable_updateResource(typedResponse.question_category));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteQuestionCategory = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await QuestionCategoryService.deleteQuestionCategory(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateQuestionCategory = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await QuestionCategoryService.stateQuestionCategory(id);
      const typedResponse = response as { question_category: QuestionCategory };
      dispatch(dataTable_updateResource(typedResponse.question_category));
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
    getQuestionCategory,
    storeQuestionCategory,
    updateQuestionCategory,
    deleteQuestionCategory,
    stateQuestionCategory,
  };
}
