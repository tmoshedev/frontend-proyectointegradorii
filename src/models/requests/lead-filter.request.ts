export interface LeadFilterRequest {
  nombre?: string;
  telefono?: string;
  campaign?: number[];
  status?: number[];
  labels?: number[];
  users?: number[];
  start_date?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}
