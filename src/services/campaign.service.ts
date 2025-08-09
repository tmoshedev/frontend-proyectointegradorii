import { Campaign } from '../models';
import { CampaignResponse } from '../models/responses';
import apiInstance from './api';

export const getCampaigns = async (
  text: string,
  type: string,
  page: number,
  limit: string,
  orderBy: string,
  order: string
) => {
  const response = await apiInstance.get(
    `/campaigns?text=${text}&type=${type}&page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`
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
  const response = await apiInstance.patch<CampaignResponse>(`/campaigns`, {
    campaign,
  });
  return response;
};

export const stateCampaign = async (id: string | number) => {
  const response = await apiInstance.patch<CampaignResponse>(`/campaigns/state`, {
    campaign: {
      id,
    },
  });
  return response;
};

// Si tu API de campañas necesita un "requirements" similar
export const getCampaignRequirements = async () => {
  const response = await apiInstance.get(`/campaigns/requirements`);
  return response;
};
