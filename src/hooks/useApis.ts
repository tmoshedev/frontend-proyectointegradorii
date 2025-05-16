import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as apisService from '../services/apis.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useApis() {
  const dispatch = useDispatch();

  //GET
  const findPerson = async (document_number: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await apisService.personSearch(document_number);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const findUbigeo = async (text: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await apisService.ubigeoSearch(text);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    findPerson,
    findUbigeo,
  };
}
