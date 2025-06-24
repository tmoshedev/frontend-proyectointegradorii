import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as useHierarchyService from '../services/user-hierarchy.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';
import { AccessUser } from '../models';

export function useUserHierarchy() {
  const dispatch = useDispatch();

  //GET - LIST LEADS
  const getUserHierarchy = async (text: string, limit: number, page: number, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await useHierarchyService.getUserHierarchy(text, limit, page);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - REQUIREMENTS
  const requirements = async () => {
    dispatch(setLoading(true));
    try {
      const response = await useHierarchyService.requirements();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - storeUserHierarchy
  const storeUserHierarchy = async (data: AccessUser, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await useHierarchyService.storeUserHierarchy(data);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //DELETE - deleteUserHierarchy
  const deleteUserHierarchy = async (user_hierarchy_id: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await useHierarchyService.deleteUserHierarchy(user_hierarchy_id);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - postHabilitarUserHierarchy
  const postHabilitarUserHierarchy = async (user_hierarchy_id: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await useHierarchyService.postHabilitarUserHierarchy(user_hierarchy_id);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    getUserHierarchy,
    requirements,
    storeUserHierarchy,
    deleteUserHierarchy,
    postHabilitarUserHierarchy,
  };
}
