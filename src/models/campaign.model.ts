export interface Campaign {
  id?: string;
  code: string;       // Código de la campaña
  name: string;          // Nombre de la campaña
  start_date: string;  // Fecha de inicio (YYYY-MM-DD)
  channel: string;       // Canal asignado
  price?: number;        // price de la campaña
  state?: string;         // Estado (ej. "Activo", "Inactivo")
}