import { Campaign } from '../models';
import { CampaignResponse } from '../models/responses';
import apiInstance from './api';

export const getCampaigns = async (
  channel_id: string,
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const rolActual = localStorage.getItem('rolActual') || '';
  const response = await apiInstance.get(
    `/campaigns?rolActual=${rolActual}&channel_id=${channel_id}&text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
  );
  return response;
};

export const storeCampaign = async (campaign: Campaign) => {
  const response = await apiInstance.post<CampaignResponse>('/campaigns', {
    campaign,
  });
  return response;
};

export const updateCampaign = async (campaign: Campaign) => {
  const parsedId = Number((campaign as any)?.id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('El identificador de la campaña debe ser un número entero mayor a 0.');
  }

  const { id, ...payload } = campaign as any;

  const response = await apiInstance.patch<CampaignResponse>(`/campaigns/${parsedId}`, {
    campaign: payload,
  });
  return response;
};

export const stateCampaign = async (campaignId: number | string) => {
  const parsedId = Number(campaignId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('El identificador de la campaña debe ser un número entero mayor a 0.');
  }

  const response = await apiInstance.patch<CampaignResponse>(`/campaigns/state`, {
    campaign: {
      id: parsedId,
    },
  });
  return response;
};

// Si tu API de campañas necesita un "requirements" similar
export const getRequirements = async () => {
  const response = await apiInstance.get(`/campaigns/requirements`);
  return response;
};
