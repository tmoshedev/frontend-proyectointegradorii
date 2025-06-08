import { Lead, UserSelect2 } from '../models';
import { ImportarLeadRequest, LeadFormRequest } from '../models/requests';
import { LeadDistribucionResponse, LeadResponse, SuccessResponse } from '../models/responses';
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

export const updateProjects = async (lead_uuid: string, projects: any[]) => {
  const response = await apiInstance.post<SuccessResponse>(`/leads/${lead_uuid}/update-projects`, {
    projects,
  });
  return response;
};

export const updateLabels = async (lead_uuid: string, labels: any[]) => {
  const response = await apiInstance.post<SuccessResponse>(`/leads/${lead_uuid}/update-labels`, {
    labels,
  });
  return response;
};

export const updateLeadValue = async (lead_uuid: string, label: string, value: string) => {
  const response = await apiInstance.patch<LeadResponse>(`/leads/${lead_uuid}`, {
    lead: {
      [label]: value,
    },
  });
  return response;
};

export const getDistribucion = async () => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<LeadDistribucionResponse>(
    `/leads/distribucion?rolActual=${rolActual}`
  );
  return response;
};

export const postDistribuirLeads = async (type: string, leads: Lead[], usuarios: UserSelect2[]) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post<LeadDistribucionResponse>(
    `/leads/distribuir?rolActual=${rolActual}`,
    {
      type,
      leads,
      usuarios,
    }
  );
  return response;
};
