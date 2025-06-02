import { LeadHistory } from '.';

export interface Lead {
  id: number;
  lead_state_id: string;
  names: string;
  last_names: string;
  cellphone: string;
  channel_name: string;
  prediccion_ia: string;
  interes: string;
  estado_final: string;
  user_id: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  user_rol_name: string;
  lead_projects: any[];
  uuid: string;
  state_histories: LeadHistory[];
  ciudad: string;
  email: string;
}
