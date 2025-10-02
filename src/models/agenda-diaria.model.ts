export interface AgendaDiaria {
  model_type: string;
  model_id: string;
  activity_name: string;
  title: string;
  activity_date: string;
  end_date_activity: string;
  start_time: string;
  end_time: string;
  start: Date;
  end: Date;
  save: boolean;
}
