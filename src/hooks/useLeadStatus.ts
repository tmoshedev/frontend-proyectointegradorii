import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as leadStatusService from '../services/lead-status.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useLeadStatus() {
  const dispatch = useDispatch();

  //GET - LEAD STATUS
  const getLeadStatus = async (
    business_id: string,
    lead_activos: string,
    type: string,
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadStatusService.getLeadStatus(business_id, lead_activos, type);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    getLeadStatus,
  };
}
