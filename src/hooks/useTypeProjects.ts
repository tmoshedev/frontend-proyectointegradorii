import { useDispatch } from 'react-redux';
/** Services */
import * as typeProjectsService from '../services/type-projects.service';
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
import { TypeProject } from '../models';

export function useTypeProjects() {
  const dispatch = useDispatch();

  const getTypeProjects = async (
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
      const response = await typeProjectsService.getTypeProjects(
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
  const storeTypeProject = async (name: string) => {
    dispatch(setLoading(true));
    try {
      const response = await typeProjectsService.storeTypeProject(
        name || '',
      );
      const typedResponse = response as { type_project: TypeProject };
      dispatch(dataTable_addResource(typedResponse.type_project));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateTypeProject = async (id: number, name: string) => {
    dispatch(setLoading(true));
    try {
      const response = await typeProjectsService.updateTypeProject(
        id,
        name || '',
      );
      const typedResponse = response as { type_project: TypeProject };
      dispatch(dataTable_updateResource(typedResponse.type_project));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteTypeProject = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await typeProjectsService.deleteTypeProject(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateTypeProject = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await typeProjectsService.stateTypeProject(id);
      const typedResponse = response as { type_project: TypeProject };
      dispatch(dataTable_updateResource(typedResponse.type_project));
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
    getTypeProjects,
    storeTypeProject,
    updateTypeProject,
    deleteTypeProject,
    stateTypeProject,
  };
}
