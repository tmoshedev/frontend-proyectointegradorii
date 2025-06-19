export interface FormLeadActividadRequest {
  lead_id: number;
  tipo_actividad: string;
  titulo: string;
  fecha_inicial: string;
  fecha_final: string;
  hora_inicial: string;
  hora_final: string;
  disponibilidad: string;
  ubicacion: string;
  check_actividad: boolean;
}
