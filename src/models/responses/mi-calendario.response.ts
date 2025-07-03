import { CalendarEvent, UserCalendario } from '..';

export interface MiCalendarioResponse {
  success: boolean;
  users: UserCalendario[];
  actividades: CalendarEvent[];
}
