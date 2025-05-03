import { LeadStatus } from '../lead-status.model';

export interface LeadStatusResponse {
  data: LeadStatus[];
  links: any;
  meta: any;
}
