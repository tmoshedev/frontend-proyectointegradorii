export interface FormLeadActividadRequest {
  lead_id: number;
  activity_type: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  availability: string;
  location: string;
  check_actividad: boolean;
}
