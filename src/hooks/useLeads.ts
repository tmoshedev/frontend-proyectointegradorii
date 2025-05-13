import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as leadsService from '../services/leads.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useLeads() {
  const dispatch = useDispatch();

  //POST - CHANGE LEAD STATE
  const changeState = async (business_id: string, type: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.postChangeState(business_id, type);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - UPDATE LEAD
  const updateLead = async (lead_id: string, data: any, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.patchUpdateLead(lead_id, data);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    changeState,
    updateLead,
  };
}
