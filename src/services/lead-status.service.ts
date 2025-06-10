import { LeadStatusResponse } from '../models/responses';
import apiInstance from './api';

export const getLeadStatus = async (business_id: string, lead_activos: string, type: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<LeadStatusResponse>(
    `/lead-status?business_id=${business_id}&type=${type}&lead_activos=${lead_activos}&rolActual=${rolActual}`
  );
  return response;
};
