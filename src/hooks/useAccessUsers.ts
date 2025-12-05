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
    state: string,
    user_uuid: string,
    text: string,
    type: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    roleless: string,
    loading: boolean,
    updateTable: boolean = false
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await accessUsersService.getAccessUsers(
        rol_id,
        state,
        user_uuid,
        text,
        type,
        page,
        limit,
        orderBy,
        order,
        roleless
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
  const updateAccessUser = async (user: Partial<AccessUser>) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.updateAccessUser(user);
      dispatch(dataTable_updateResource(response.access_user));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateAccessUserRole = async (userId: number, roleId: string | number) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.updateAccessUserRole(userId, roleId);
      dispatch(dataTable_updateResource(response.access_user));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateAccessUserRoles = async (userId: number, roleIds: Array<string | number>) => {
    dispatch(setLoading(true));
    try {
      const response = await accessUsersService.updateAccessUserRoles(userId, roleIds);
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
    updateAccessUserRole,
    updateAccessUserRoles,
    stateAccessUser,
    resetPasswordAccessUser,
    getRequirements,
  };
}
