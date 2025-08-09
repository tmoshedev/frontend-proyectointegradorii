import { Campaign } from '..';

export interface CampaignResponse {
  success: boolean;
  message: string;
  campaign: Campaign;
}
