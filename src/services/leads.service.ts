import { LeadResponse, SuccessResponse } from '../models/responses';
import apiInstance from './api';

export const postChangeState = async (lead_state_id: string, lead_id: string) => {
  const response = await apiInstance.post<SuccessResponse>(`/leads/change-state`, {
    lead: {
      lead_state_id,
      lead_id,
    },
  });
  return response;
};

export const patchUpdateLead = async (lead_id: string, data: any) => {
  const response = await apiInstance.patch<LeadResponse>(`/leads/${lead_id}`, {
    lead: data,
  });
  return response;
};
