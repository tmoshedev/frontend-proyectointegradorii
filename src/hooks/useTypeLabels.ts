import { useDispatch } from 'react-redux';
/** Services */
import * as typelabelsService from '../services/type-labels.service';
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
import { TypeLabel } from '../models';

export function useTypeLabels() {
  const dispatch = useDispatch();

  const getTypeLabels = async (
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
      const response = await typelabelsService.getTypeLabels(
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
  const storeTypeLabel = async (name: string) => {
    dispatch(setLoading(true));
    try {
      const response = await typelabelsService.storeTypeLabel(
        name || '',
      );
      const typedResponse = response as { type_label: TypeLabel };
      dispatch(dataTable_addResource(typedResponse.type_label));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateTypeLabel = async (id: number, name: string) => {
    dispatch(setLoading(true));
    try {
      const response = await typelabelsService.updateTypeLabel(
        id,
        name || '',
      );
      const typedResponse = response as { typelabel: TypeLabel };
      dispatch(dataTable_updateResource(typedResponse.typelabel));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteTypeLabel = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await typelabelsService.deleteTypeLabel(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateTypeLabel = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await typelabelsService.stateTypeLabel(id);
      const typedResponse = response as { typelabel: TypeLabel };
      dispatch(dataTable_updateResource(typedResponse.typelabel));
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
    getTypeLabels,
    storeTypeLabel,
    updateTypeLabel,
    deleteTypeLabel,
    stateTypeLabel,
  };
}
