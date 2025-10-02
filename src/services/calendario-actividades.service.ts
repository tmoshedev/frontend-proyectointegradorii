import { FormLeadActividadRequest } from '../models/requests';
import { AgendaDiariaResponse } from '../models/responses';
import { MiCalendarioResponse } from '../models/responses/mi-calendario.response';
import apiInstance from './api';

export const getAgendaDiaria = async (date: string) => {
  const response = await apiInstance.get<AgendaDiariaResponse>(`/agenda-diaria?date=${date}`);
  return response;
};

export const postLeadActividad = async (actividad: FormLeadActividadRequest) => {
  const response = await apiInstance.post('/lead-activities', {
    lead_activity: actividad,
  });
  return response;
};

export const postActividadCompletada = async (uuid: string) => {
  const response = await apiInstance.post(`/lead-activities/completado`, {
    lead_activity_uuid: uuid,
  });
  return response;
};

export const postCancelarActividad = async (lead_activity_uuid: string, motive: string) => {
  const response = await apiInstance.post(`/lead-activities/cancelar`, {
    lead_activity_uuid,
    motive,
  });
  return response;
};

export const getMiCalendario = async (date_start: string, date_end: string) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get<MiCalendarioResponse>(
    `/mi-calendario?rolActual=${rolActual}&date_start=${date_start}&date_end=${date_end}`
  );
  return response;
};
