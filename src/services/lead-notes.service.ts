import { LeadNoteRequest } from '../models/requests';
import { LeadNoteResponse } from '../models/responses';
import apiInstance from './api';

export const storeLeadNote = async (lead_note: LeadNoteRequest) => {
  const response = await apiInstance.post<LeadNoteResponse>(`/lead-notes`, {
    lead_note: lead_note,
  });
  return response;
};
