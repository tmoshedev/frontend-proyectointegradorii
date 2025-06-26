import { Lead, UserSelect2 } from '../models';
import { ImportarLeadRequest, LeadFormRequest } from '../models/requests';
import {
  LeadDistribucionResponse,
  LeadResponse,
  SuccessResponse,
  TableCrmResponse,
} from '../models/responses';
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

export const importLeads = async (data: ImportarLeadRequest, asignarmeLead: boolean) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post<SuccessResponse>(`/leads/import?rolActual=${rolActual}`, {
    data,
    asignarme_lead: asignarmeLead,
  });
  return response;
};

export const storeLead = async (data: LeadFormRequest) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post<LeadResponse>(`/leads?rolActual=${rolActual}`, {
    lead: data,
  });
  return response;
};

export const getLead = async (lead_uuid: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<LeadResponse>(
    `/leads/${lead_uuid}?rolActual=${rolActual}`
  );
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

export const postDistribuirLeads = async (
  type: string,
  leads: Lead[],
  usuarios: UserSelect2[],
  typeUsuario: string
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.post<LeadDistribucionResponse>(
    `/leads/distribuir?rolActual=${rolActual}`,
    {
      type,
      leads,
      usuarios,
      typeUsuario,
    }
  );
  return response;
};

export const updateLeadAsesor = async (lead_uuid: string, assigned_to: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.patch<LeadResponse>(
    `/leads/${lead_uuid}/update-asesor?rolActual=${rolActual}`,
    {
      lead: {
        assigned_to,
      },
    }
  );
  return response;
};

export const changeEstadoFinal = async (id: string, estado_final: string) => {
  const response = await apiInstance.patch<LeadResponse>(`/leads/${id}/change-estado-final`, {
    lead: {
      estado_final,
    },
  });
  return response;
};

export const getLeads = async (
  user_ids: string,
  channel_ids: string,
  lead_label_ids: string,
  stage_ids: string,
  project_ids: string,
  text: string,
  limit: number,
  page: number
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<TableCrmResponse>(
    `/leads?rolActual=${rolActual}&text=${text}&limit=${limit}&page=${page}&user_ids=${user_ids}&channel_ids=${channel_ids}&lead_label_ids=${lead_label_ids}&stage_ids=${stage_ids}&project_ids=${project_ids}`
  );
  return response;
};
