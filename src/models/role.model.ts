export interface Role {
  id?: number;
  code: string;
  name: string;
  guard_name?: string;
  state?: boolean | number | string;
  detached_users?: number;
  permissions?: Array<string | number | { id?: string | number; name?: string; permission?: string; slug?: string; code?: string }>;
  permission_names?: string[];
  permissions_detail?: Array<{ id?: string | number; name?: string; permission?: string; slug?: string; code?: string }>;
}