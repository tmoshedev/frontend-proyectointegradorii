import { User } from '../user.model';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  // Para 2FA
  '2fa_required'?: boolean;
  userId?: number;
  message?: string;
}
