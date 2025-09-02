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
  estado_final: string;
  user_id: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  user_rol_name: string;
  lead_projects: LeadProject[];
  lead_labels: LeadLabel[];
  uuid: string;
  state_histories: LeadHistory[];
  ciudad: string;
  precio: string;
  info: string;
  email: string;
  asesor_estado: string;
  supervisor_names: string;
  fecha_creacion?: string;
  actividad_estado: LeadActividadEstado;
  campaign_codigo: string;
  conteo_actividad: number;
}
