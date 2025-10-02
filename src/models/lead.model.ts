import { LeadActividadEstado, LeadHistory, LeadLabel, LeadProject } from '.';

export interface Lead {
  reason: string;
  
  id: number;
  lead_state_id: string;
  document_number: string;
  names: string;
  last_names: string;
  cellphone: string;
  channel_name: string;
  channel_icon_html: string;
  prediccion_ia: string;
  interes: string;
  final_state: string;
  user_id: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  user_rol_name: string;
  lead_projects: LeadProject[];
  lead_labels: LeadLabel[];
  uuid: string;
  state_histories: LeadHistory[];
  city: string;
  price: string;
  info: string;
  email: string;
  advisor_state: string;
  supervisor_names: string;
  creation_date?: string;
  actividad_estado: LeadActividadEstado;
  campaign_code: string;
  conteo_actividad: number;
}
