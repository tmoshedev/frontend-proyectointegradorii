export interface Project {
  id?: string;
  name: string;          // Nombre del proyecto
  state?: string;         // Estado (ej. "Activo", "Inactivo")
  type_project_id?: string; // ID del tipo de proyecto
}