import { useDispatch } from 'react-redux';
/** Services */
import * as labelsService from '../services/labels.service';
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
import { Label } from '../models';

export function useLabels() {
  const dispatch = useDispatch();

  const getLabels = async (
    text: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    updateTable: boolean = false
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await labelsService.getLabels(
        text,
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
  const storeLabel = async (name: string, color: string) => {
    dispatch(setLoading(true));
    try {
      const response = await labelsService.storeLabel(
        name || '',
        color || ''
      );
      const typedResponse = response as { label: Label };
      dispatch(dataTable_addResource(typedResponse.label));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateLabel = async (id: number, name: string, color: string) => {
    dispatch(setLoading(true));
    try {
      const response = await labelsService.updateLabel(
        id,
        name || '',
        color || ''
      );
      const typedResponse = response as { label: Label };
      dispatch(dataTable_updateResource(typedResponse.label));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteLabel = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await labelsService.deleteLabel(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateLabel = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await labelsService.stateLabel(id);
      const typedResponse = response as { label: Label };
      dispatch(dataTable_updateResource(typedResponse.label));
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
    getLabels,
    storeLabel,
    updateLabel,
    deleteLabel,
    stateLabel,
  };
}
