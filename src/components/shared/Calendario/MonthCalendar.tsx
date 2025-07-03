import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '../../../models';

interface Props {
  date_start: string;
  events: CalendarEvent[];
  date_end: string;
}
export const MonthCalendarComponent = (props: Props) => {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Convertir a Date
  const startDate = parseISO(props.date_start);
  const endDate = parseISO(props.date_end);

  // Primer y último día del mes
  const monthStart = startOfMonth(startDate);
  const monthEnd = endOfMonth(endDate);

  // Primer día visible (lunes de la semana del primer día del mes)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // lunes
  // Último día visible (domingo de la semana del último día del mes)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // domingo

  // Generar los 42 días
  const days: Date[] = [];
  let day = calendarStart;
  for (let i = 0; i < 42; i++) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="crm-calendar-month-containmer">
      <div className="crm-calendar-month">
        {dias.map((dia, index) => (
          <span key={index} className="crm-calendar-month-day-name">
            {dia}
          </span>
        ))}
        {days.map((date, idx) => {
          const isDisabled = date < startDate || date > endDate;
          const hoy = new Date();
          const esHoy =
            date.getDate() === hoy.getDate() &&
            date.getMonth() === hoy.getMonth() &&
            date.getFullYear() === hoy.getFullYear();
          const isFirst = date.getDate() === 1;

          const dayClass = `crm-calendar-day-name${esHoy || isFirst ? ' day-font-bold' : ''}${
            esHoy ? ' text-primary' : ''
          }`;
          const dayLabel = esHoy
            ? 'Hoy'
            : isFirst
            ? format(date, 'd MMM.', { locale: es })
            : date.getDate();

          // Filtrar eventos de este día
          const eventosDelDia = props.events.filter(
            (ev) =>
              format(parseISO(ev.fecha_actividad), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          const cantidad = eventosDelDia.length;

          return (
            <div
              key={idx}
              className={`crm-calendar-month-days${isDisabled ? ' day--disabled' : ''}`}
            >
              <div className="crm-calendar-month-day-wrap">
                <div className={dayClass}>{dayLabel}</div>
                {cantidad > 0 && (
                  <div className="crm-calendar-month-day-events">
                    {cantidad.toString().padStart(2, '0')} actividad{cantidad > 1 ? 'es' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendarComponent;
