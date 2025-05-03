import { LeadStatusResponse } from '../models/responses';
import apiInstance from './api';

export const getLeadStatus = async (business_id: string, type: string) => {
  const response = await apiInstance.get<LeadStatusResponse>(
    `/lead-status?business_id=${business_id}&type=${type}`
  );
  return response;
};
