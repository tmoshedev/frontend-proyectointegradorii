import { Lead, UserSelect2 } from '..';

export interface LeadDistribucionResponse {
  leads: Lead[];
  users: UserSelect2[];
  comercial_asesores: UserSelect2[];
}
