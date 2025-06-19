export interface AgendaDiaria {
  model_type: string;
  model_id: string;
  activity_name: string;
  title: string;
  fecha_actividad: string;
  fecha_fin_actividad: string;
  hora_inicio: string;
  hora_fin: string;
  start: Date;
  end: Date;
  save: boolean;
}
