import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as accessUsersService from '../services/access-users.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';
import {
  dataTable_addResource,
  dataTable_clearAll,
  dataTable_setAlls,
  dataTable_updateResource,
} from '../redux/states/dataTable.slice';
import { useEffect } from 'react';
import { AccessUser } from '../models';

export function useAccessUsers() {
  const dispatch = useDispatch();

  //GET
  const getAccessUsers = async (
    rol_id: string,
    text: string,
    type: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    loading: boolean,
    updateTable: boolean = false
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await accessUsersService.getAccessUsers(
        rol_id,
        text,
        type,
        page,
        limit,
        orderBy,
        order
      );

      if (updateTable) {
        dispatch(dataTable_setAlls(response)); // Solo si `updateTable` es true
      }

      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //STORE
  const storeAccessUser = async (user: AccessUser) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.storeAccessUser(user);
      dispatch(dataTable_addResource(response.access_user));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateAccessUser = async (user: AccessUser) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.updateAccessUser(user);
      dispatch(dataTable_updateResource(response.access_user));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const stateAccessUser = async (user: AccessUser) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.stateAccessUser(user);
      dispatch(dataTable_updateResource(response.access_user));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPasswordAccessUser = async (user: AccessUser) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.resetPasswordAccessUser(user);
      dispatch(dataTable_updateResource(response));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRequirements = async (loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await accessUsersService.getRequirements();
      return response;
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
  }, []);

  return {
    getAccessUsers,
    storeAccessUser,
    updateAccessUser,
    stateAccessUser,
    resetPasswordAccessUser,
    getRequirements,
  };
}
