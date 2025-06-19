import { Activity, Lead, LeadProject, UserSelect2 } from '..';
import { LeadHistorialResponse } from './lead-historial.response';

export interface LeadResponse {
  state: boolean;
  lead: Lead;
  lead_historial: LeadHistorialResponse[];
  count_historial: {
    notes: number;
    state_changes: number;
    activities: number;
  };
  projects_available: LeadProject[];
  labels_available: any[];
  users: UserSelect2[];
  activities: Activity[];
}
