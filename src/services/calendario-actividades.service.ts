import { FormLeadActividadRequest } from '../models/requests';
import { AgendaDiariaResponse } from '../models/responses';
import apiInstance from './api';

export const getAgendaDiaria = async (date: string) => {
  const response = await apiInstance.get<AgendaDiariaResponse>(`/agenda-diaria?date=${date}`);
  return response;
};

export const postLeadActividad = async (actividad: FormLeadActividadRequest) => {
  const response = await apiInstance.post('/lead-activities', {
    lead_actividad: actividad,
  });
  return response;
};

export const postActividadCompletada = async (uuid: string) => {
  const response = await apiInstance.post(`/lead-activities/completado`, {
    lead_actividad_uuid: uuid,
  });
  return response;
};

export const postCancelarActividad = async (lead_activity_uuid: string, motivo: string) => {
  const response = await apiInstance.post(`/lead-activities/cancelar`, {
    lead_activity_uuid,
    motivo,
  });
  return response;
};
