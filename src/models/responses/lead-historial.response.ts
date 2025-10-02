export interface LeadHistorialResponse {
  type: string;
  created_at: string;
  created_formatted: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  user_id?: number;
  data: {
    state_current: string;
    state_moved: string;
    note: string;
    text: string;
    title: string;
    activity_name: string;
    state: string;
    uuid: string;
    motive: string;
  };
}
