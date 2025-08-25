import { EtapaConPaginacion, LeadStatusResponse } from '../models/responses';
import apiInstance from './api';

export const getLeadStatus = async (
  business_id: string,
  lead_activos: string,
  type: string,
  user_ids: string,
  channel_ids: string,
  lead_label_ids: string,
  stage_ids: string,
  project_ids: string,
  activity_expiration_ids: string,
  lead_campaign_names: string,
  nivel_interes: string
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<LeadStatusResponse>(
    `/lead-status?business_id=${business_id}&type=${type}&lead_activos=${lead_activos}&rolActual=${rolActual}&user_ids=${user_ids}&channel_ids=${channel_ids}&lead_label_ids=${lead_label_ids}&stage_ids=${stage_ids}&project_ids=${project_ids}&activity_expiration_ids=${activity_expiration_ids}&lead_campaign_names=${lead_campaign_names}&nivel_interes=${nivel_interes}`
  );
  return response;
};

export const getLeadByEtapa = async (
  business_id: string,
  lead_activos: string,
  etapa_ids: string,
  user_ids: string,
  channel_ids: string,
  lead_label_ids: string,
  stage_ids: string,
  project_ids: string,
  activity_expiration_ids: string,
  lead_campaign_names: string,
  nivel_interes: string,
  text: string,
  limit: number,
  page: number
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<EtapaConPaginacion>(
    `/lead-status/leads?business_id=${business_id}&lead_activos=${lead_activos}&etapa_ids=${etapa_ids}&rolActual=${rolActual}&user_ids=${user_ids}&channel_ids=${channel_ids}&lead_label_ids=${lead_label_ids}&stage_ids=${stage_ids}&project_ids=${project_ids}&activity_expiration_ids=${activity_expiration_ids}&lead_campaign_names=${lead_campaign_names}&nivel_interes=${nivel_interes}&text=${text}&limit=${limit}&page=${page}`
  );
  return response;
};
