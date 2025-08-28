import { useDispatch } from 'react-redux';
/** Services */
import * as projectsService from '../services/projects.service';
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
import { Project } from '../models';

export function useProjects() {
  const dispatch = useDispatch();

  const getProjects = async (
    type_project_id: string,
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
      const response = await projectsService.getProjects(
        type_project_id,
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
  const storeProject = async (type_project_id: string, name: string, image: string) => {
    dispatch(setLoading(true));
    try {
      const response = await projectsService.storeProject(
        type_project_id || '',
        name || '',
        image || ''
      );
      const typedResponse = response as { project: Project };
      dispatch(dataTable_addResource(typedResponse.project));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateProject = async (id: number, name: string, image: string) => {
    dispatch(setLoading(true));
    try {
      const response = await projectsService.updateProject(
        id,
        name || '',
        image || ''
      );
      const typedResponse = response as { project: Project };
      dispatch(dataTable_updateResource(typedResponse.project));
      return typedResponse;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE
  const deleteProject = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await projectsService.deleteProject(id);
      dispatch(dataTable_deleteResource(id));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STATE
  const stateProject = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await projectsService.stateProject(id);
      const typedResponse = response as { project: Project };
      dispatch(dataTable_updateResource(typedResponse.project));
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
    getProjects,
    storeProject,
    updateProject,
    deleteProject,
    stateProject,
  };
}
