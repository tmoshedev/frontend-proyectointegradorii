import { LeadStatusResponse } from '../models/responses';
import apiInstance from './api';

export const getLeadStatus = async (
  business_id: string,
  lead_activos: string,
  type: string,
  user_ids: string,
  channel_ids: string,
  lead_label_ids: string,
  stage_ids: string
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<LeadStatusResponse>(
    `/lead-status?business_id=${business_id}&type=${type}&lead_activos=${lead_activos}&rolActual=${rolActual}&user_ids=${user_ids}&channel_ids=${channel_ids}&lead_label_ids=${lead_label_ids}&stage_ids=${stage_ids}`
  );
  return response;
};
