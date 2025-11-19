/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
/**Models */
import { Role } from "../models";
/**Services */
import * as accessService from "../services/access-users.service";
/**Redux */
import { setLoading } from "../redux/states/loading.slice";
import {
  dataTable_clearAll,
  dataTable_setAlls,
} from "../redux/states/dataTable.slice";
import { useEffect } from "react";
import { checkAuth } from "../services/auth.service";
import { setUser } from "../redux/states/auth.slice";
import { MANDATORY_PERMISSION_SLUGS, getPermissionSlug } from "../utilities/permission.utils";

export function useRoles() {
  const dispatch = useDispatch();

  const toArray = (source: any): any[] => {
    if (!source) {
      return [];
    }

    if (Array.isArray(source)) {
      return source;
    }

    if (Array.isArray(source?.data)) {
      return source.data;
    }

    return [];
  };

  const refreshUserSession = async () => {
    try {
      const response = await checkAuth();
      if (response?.user) {
        const processedUser = {
          ...response.user,
          must_change_password: !!response.user.must_change_password,
        };
        dispatch(setUser(processedUser));
      }
    } catch (error) {
      console.error("No se pudo refrescar la sesión después de actualizar roles", error);
    }
  };

  const ensureMandatoryPermissions = async (roleId: string | number | undefined | null) => {
    if (roleId === undefined || roleId === null) {
      return;
    }

    const roleIdStr = String(roleId);

    try {
      const assignedResponse = await accessService.permissionsAssign(roleIdStr);
      const assignedList = toArray(assignedResponse?.data ?? assignedResponse);
      const assignedSlugs = new Set(
        assignedList
          .map((entry: any) => getPermissionSlug(entry))
          .filter((slug): slug is string => Boolean(slug))
      );

      const missingSlugs = MANDATORY_PERMISSION_SLUGS.filter(
        (slug) => !assignedSlugs.has(slug)
      );

      if (missingSlugs.length === 0) {
        return;
      }

      const notAssignedResponse = await accessService.permissionsNotAssign(roleIdStr);
      const notAssignedList = toArray(notAssignedResponse?.data ?? notAssignedResponse);

      const permissionsToAssign: string[] = [];
      notAssignedList.forEach((entry: any) => {
        const slug = getPermissionSlug(entry);
        if (slug && missingSlugs.includes(slug)) {
          const rawId = entry.id ?? entry.permission_id ?? entry.uuid;
          if (rawId !== undefined && rawId !== null) {
            permissionsToAssign.push(String(rawId));
          }
        }
      });

      if (permissionsToAssign.length === 0) {
        console.warn(
          "No se encontraron IDs de permisos obligatorios para asignar al rol",
          roleId
        );
        return;
      }

      await accessService.updatePermissions(roleIdStr, permissionsToAssign, "SIN_ASIGNAR");
    } catch (error) {
      console.error(
        "No se pudieron asegurar los permisos obligatorios para el rol",
        roleId,
        error
      );
    }
  };

  const extractRoleIdFromResponse = (response: any, roleInput?: Role): number | null => {
    if (!response || typeof response !== "object") {
      return roleInput?.id ?? null;
    }

    const candidateOrder = [
      response?.data?.id,
      response?.id,
      response?.role?.id,
      response?.data?.role?.id,
      response?.data?.data?.id,
      response?.result?.id,
      response?.data?.result?.id,
    ];

    for (const candidate of candidateOrder) {
      if (candidate !== undefined && candidate !== null) {
        const parsed = Number(candidate);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }

    if (roleInput?.id !== undefined) {
      return roleInput.id as number;
    }

    return null;
  };

  //ROLES

  const getRoles = async (
    page: number,
    text: string,
    limit: string,
    loading: boolean,
    includeInactive: boolean = true,
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await accessService.getRoles(page, text, limit, includeInactive);
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
      await ensureMandatoryPermissions(role_id);
      await refreshUserSession();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //CREAR ROL
  const createRole = async (role: Role) => {
    dispatch(setLoading(true));
    try {
      const response = await accessService.storeRole(role);
      const roleId = extractRoleIdFromResponse(response, role);
      await ensureMandatoryPermissions(roleId);
      await refreshUserSession();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const toggleRoleState = async (roleId: number, state: boolean) => {
    dispatch(setLoading(true));
    try {
      const response = await accessService.updateRoleState(roleId, state);
      await refreshUserSession();
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
    createRole,
    toggleRoleState,
  };
}
