import { UserSelect2, LeadStatus } from '..';

export interface LeadStatusResponse {
  success: boolean;
  message: string;
  data: {
    lead_etapas: LeadStatus[];
    users: UserSelect2[];
    channels: any[];
    labels: any[];
    stages: any[];
    projects: any[];
    campaigns: any[];
  };
}
