import { Lead } from './lead.model';

export interface LeadStatus {
  id: string;
  name: string;
  order: number;
  leads: Lead[];
}
