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
    user_ids: string,
    channel_ids: string,
    lead_label_ids: string,
    stage_ids: string,
    project_ids: string,
    activity_expiration_ids: string,
    nivel_interes: string,
    /**Loading */
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadStatusService.getLeadStatus(
        business_id,
        lead_activos,
        type,
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        nivel_interes
      );
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - getLeadByEtapa
  const getLeadByEtapa = async (
    business_id: string,
    lead_activos: string,
    etapa_ids: string,
    user_ids: string,
    channel_ids: string,
    lead_label_ids: string,
    stage_ids: string,
    project_ids: string,
    activity_expiration_ids: string,
    nivel_interes: string,
    limit: number,
    page: number,
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadStatusService.getLeadByEtapa(
        business_id,
        lead_activos,
        etapa_ids,
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        nivel_interes,
        limit,
        page
      );
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    getLeadStatus,
    getLeadByEtapa,
  };
}
