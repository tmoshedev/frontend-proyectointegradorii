/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
/**Models */
/**Services */
import * as accessService from "../services/access-users.service";
/**Redux */
import { setLoading } from "../redux/states/loading.slice";
import {
  dataTable_clearAll,
  dataTable_setAlls,
} from "../redux/states/dataTable.slice";
import { useEffect } from "react";

export function useRoles() {
  const dispatch = useDispatch();

  //ROLES

  const getRoles = async (
    page: number,
    text: string,
    limit: string,
    loading: boolean,
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await accessService.getRoles(page, text, limit);
      dispatch(dataTable_setAlls(response));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PERMISOS NO ASIGNADOS
  const permissionsNotAssign = async (role_id: string) => {
    dispatch(setLoading(true));
    try {
      const response = await accessService.permissionsNotAssign(role_id);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PERMISOS ASIGNADOS
  const permissionsAssign = async (role_id: string) => {
    dispatch(setLoading(true));
    try {
      const response = await accessService.permissionsAssign(role_id);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //ACTUALIZAR PERMISOS
  const updatePermissions = async (
    role_id: string,
    permissions: string[],
    type: string,
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await accessService.updatePermissions(
        role_id,
        permissions,
        type,
      );
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    return () => {
      // Esto se ejecutará cuando el componente se desmonte.
      dispatch(dataTable_clearAll()); // Asegúrate de haber importado dataTable_clear.
    };
  }, [dispatch]);

  return {
    getRoles,
    permissionsNotAssign,
    permissionsAssign,
    updatePermissions,
  };
}
