import { AccessUser } from '..';

export interface AccessUserResponse {
  success: boolean;
  message: string;
  access_user: AccessUser;
}
