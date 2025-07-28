import { EtapaMeta, Lead, LeadStatus } from '..';

export interface EtapaConPaginacion extends LeadStatus {
  leads: Lead[];
  leads_count: number;
  meta: EtapaMeta;
}
