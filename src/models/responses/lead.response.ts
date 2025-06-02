import { Lead } from '..';
import { LeadHistorialResponse } from './lead-historial.response';

export interface LeadResponse {
  state: boolean;
  lead: Lead;
  lead_historial: LeadHistorialResponse[];
  count_historial: {
    notes: number;
    state_changes: number;
  };
}
