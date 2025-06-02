import { ImportarLeadRequest, LeadFormRequest } from '../models/requests';
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

export const requirements = async () => {
  const response = await apiInstance.get(`/leads/requirements`);
  return response;
};

export const importLeads = async (data: ImportarLeadRequest) => {
  const response = await apiInstance.post<SuccessResponse>(`/leads/import`, {
    data,
  });
  return response;
};

export const storeLead = async (data: LeadFormRequest) => {
  const response = await apiInstance.post<LeadResponse>(`/leads`, {
    lead: data,
  });
  return response;
};

export const getLead = async (lead_uuid: string) => {
  const response = await apiInstance.get<LeadResponse>(`/leads/${lead_uuid}`);
  return response;
};

export const getLeadHistorial = async (lead_uuid: string, type: string) => {
  const response = await apiInstance.get<LeadResponse>(
    `/leads/${lead_uuid}/historial?type=${type}`
  );
  return response;
};
