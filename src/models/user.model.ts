/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserLabel } from '.';

export interface User {
  id: number;
  photo: string;
  document_number: string;
  email: string;
  names: string;
  father_last_name: string;
  mother_last_name: string;
  roles: any[];
  user_labels: UserLabel[];
  permissions: string[];
}
