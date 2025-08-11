export interface Campaign {
  codigo: string;       // Código de la campaña
  name: string;          // Nombre de la campaña
  fecha_inicio: string;  // Fecha de inicio (YYYY-MM-DD)
  channel: string;       // Canal asignado
  precio?: number;        // Precio de la campaña
  state?: string;         // Estado (ej. "Activo", "Inactivo")
}