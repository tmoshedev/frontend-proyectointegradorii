export interface LeadFilterRequest {
  nombre?: string;
  telefono?: string;
  campaign?: number[];
  status?: number[];
  labels?: number[];
  users?: number[];
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}
