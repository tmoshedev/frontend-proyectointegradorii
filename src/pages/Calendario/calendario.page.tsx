import WeeklyCalendar from '../../components/shared/Calendario/WeeklyCalendar';
import { useEffect, useState } from 'react';
import { setTitleSidebar } from '../../redux/states/auth.slice';
import { useDispatch } from 'react-redux';
import { useCalendarioActividades, useSidebarResponsive } from '../../hooks';
/**Components */
import CrmCalendarTopbarComponent, { ViewType } from './components/crm-calendar-topbar.component';
/**Moment */
import moment from 'moment';
import { MiCalendarioResponse } from '../../models/responses';
import { CalendarEvent, UserCalendario } from '../../models';
import MonthCalendarComponent from '../../components/shared/Calendario/MonthCalendar';
import { useNavigate } from 'react-router-dom';

export const CalendarioPage = () => {
  useSidebarResponsive(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [users, setUsers] = useState<UserCalendario[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { getMiCalendario } = useCalendarioActividades();

  const [formData, setFormData] = useState<{
    type: ViewType;
    start_date: string;
    end_date: string;
  }>({
    type: 'SEMANA',
    start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'), // lunes
    end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'), // domingo
  });

  const onEvent = (event: CalendarEvent) => {
    switch (event.model_type) {
      case 'LEAD_ACTIVITY':
        navigate(`/leads/${event.model_uuid}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    dispatch(setTitleSidebar('Calendario'));

    // Limpia el estado al desmontar
    return () => {
      dispatch(setTitleSidebar(''));
    };
  }, []);

  useEffect(() => {
    const dataInicial = () => {
      getMiCalendario(formData.start_date, formData.end_date, true).then(
        (response: MiCalendarioResponse) => {
          setUsers(response.users);
          setEvents(response.actividades);
        }
      );
    };

    dataInicial();
  }, [formData.start_date, formData.end_date]);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.08)' }}
    >
      <div
        className="container-fluid p-0"
        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.4rem)' }}
      >
        <div className="row">
          <div className="col-12">
            <CrmCalendarTopbarComponent setFormData={setFormData} formData={formData} />
          </div>
          <div className="col-12">
            {/* <MyCalendarComponent /> */}
            {formData.type == 'SEMANA' && (
              <WeeklyCalendar
                weekStart={moment(formData.start_date).toDate()}
                events={events}
                startHour={6}
                users={users}
                onEvent={onEvent}
              />
            )}
            {formData.type == 'DIA' && (
              <WeeklyCalendar
                weekStart={moment(formData.start_date).toDate()}
                events={events}
                startHour={6}
                users={users}
                numberOfDays={1}
                onEvent={onEvent}
              />
            )}
            {formData.type == 'MES' && (
              <MonthCalendarComponent
                date_start={formData.start_date}
                date_end={formData.end_date}
                events={events}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioPage;
