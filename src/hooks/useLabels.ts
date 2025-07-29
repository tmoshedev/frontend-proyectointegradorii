import { useDispatch } from 'react-redux';
/**Models */
/**Services */
import * as labelsService from '../services/labels.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useLabels() {
  const dispatch = useDispatch();

  //POST - STORE LABEL
  const storeLabel = async (name: string, color: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await labelsService.storeLabel(name, color);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    storeLabel,
  };
}
