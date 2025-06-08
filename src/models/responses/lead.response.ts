import { Lead, LeadProject, UserSelect2 } from '..';
import { LeadHistorialResponse } from './lead-historial.response';

export interface LeadResponse {
  state: boolean;
  lead: Lead;
  lead_historial: LeadHistorialResponse[];
  count_historial: {
    notes: number;
    state_changes: number;
  };
  projects_available: LeadProject[];
  labels_available: any[];
  users: UserSelect2[];
}
