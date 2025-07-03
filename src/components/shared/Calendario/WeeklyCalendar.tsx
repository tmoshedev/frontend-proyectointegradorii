import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { CalendarEvent, UserCalendario } from '../../../models';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export interface User {
  id: number;
  abb: string;
  names: string;
}

interface WeeklyCalendarProps {
  weekStart: Date;
  events: CalendarEvent[];
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  users: UserCalendario[];
  numberOfDays?: number;
  onEvent: (event: CalendarEvent) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  weekStart,
  events = [],
  startHour = 0,
  endHour = 23,
  stepMinutes = 60,
  users,
  numberOfDays = 7,
  onEvent,
}) => {
  const [now, setNow] = useState(dayjs().tz('America/Lima'));
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
    visible: boolean;
    eventId: string | null;
  }>({
    x: 0,
    y: 0,
    visible: false,
    eventId: null,
  });

  const handleMouseEnter = (e: React.MouseEvent, eventId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 60,
      visible: true,
      eventId,
    });
  };

  const handleMouseLeave = () => {
    setTooltipPosition((prev) => ({ ...prev, visible: false, eventId: null }));
  };

  const hourHeightRem = 3.75;

  // Calcula la posición superior en formato decimal (ej: 16:30 -> 16.5)
  const currentHourDecimal = now.hour() + now.minute() / 60;
  const topPositionRem = (currentHourDecimal - startHour) * hourHeightRem;

  // Genera los 7 días de la semana
  const days = useMemo(
    () => Array.from({ length: numberOfDays }, (_, i) => dayjs(weekStart).add(i, 'day')),
    [weekStart, numberOfDays] // <-- Actualizar dependencias
  );

  // Genera los slots de hora
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h += 1) {
      slots.push(dayjs().hour(h).minute(0).format('h:mm A'));
    }
    return slots;
  }, [startHour, endHour]);

  const handleScroll = () => {
    if (tooltipPosition.visible) {
      setTooltipPosition((prev) => ({ ...prev, visible: false, eventId: null }));
    }
  };

  // Sincroniza scroll
  useEffect(() => {
    const bodyEl = bodyRef.current;
    const headerEl = headerRef.current;
    const timeEl = timelineRef.current;
    if (!bodyEl || !headerEl || !timeEl) return;

    let isScrolling = false;

    const onBodyScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      headerEl.scrollLeft = bodyEl.scrollLeft;
      timeEl.scrollTop = bodyEl.scrollTop;

      headerEl.scrollLeft = bodyEl.scrollLeft;
      timeEl.scrollTop = bodyEl.scrollTop;

      // Ocultar tooltip durante scroll
      handleScroll();

      setTimeout(() => {
        isScrolling = false;
      }, 0);
    };

    const onTimelineScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      bodyEl.scrollTop = timeEl.scrollTop;

      // Ocultar tooltip durante scroll
      handleScroll();

      setTimeout(() => {
        isScrolling = false;
      }, 0);
    };

    const onHeaderScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      bodyEl.scrollLeft = headerEl.scrollLeft;

      setTimeout(() => {
        isScrolling = false;
      }, 0);
    };

    // Permitir scroll sobre los eventos
    const onEventWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Scroll vertical
        bodyEl.scrollTop += e.deltaY;
      } else {
        // Scroll horizontal
        bodyEl.scrollLeft += e.deltaX;
      }
    };

    // Agregar listeners a todos los eventos existentes
    const eventElements = bodyEl.querySelectorAll('.crm-card-event');
    eventElements.forEach((eventEl) => {
      eventEl.addEventListener('wheel', onEventWheel as EventListener, { passive: false });
    });

    bodyEl.addEventListener('scroll', onBodyScroll);
    timeEl.addEventListener('scroll', onTimelineScroll);
    headerEl.addEventListener('scroll', onHeaderScroll);

    return () => {
      bodyEl.removeEventListener('scroll', onBodyScroll);
      timeEl.removeEventListener('scroll', onTimelineScroll);
      headerEl.removeEventListener('scroll', onHeaderScroll);

      // Remover listeners de eventos
      eventElements.forEach((eventEl) => {
        eventEl.removeEventListener('wheel', onEventWheel as EventListener);
      });
    };
  }, [tooltipPosition.visible]);
  // ...existing code...

  // Scroll inicial a la hora actual
  useEffect(() => {
    const bodyEl = bodyRef.current;
    if (bodyEl) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const initialTopPos =
        (dayjs().tz('America/Lima').hour() + dayjs().tz('America/Lima').minute() / 60 - startHour) *
        hourHeightRem;
      const scrollTopInPx = initialTopPos * rootFontSize;
      const centeredScrollTop = scrollTopInPx - bodyEl.clientHeight / 2;
      bodyEl.scrollTop = Math.max(0, centeredScrollTop);
    }
  }, [startHour, hourHeightRem]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs().tz('America/Lima'));
    }, 60000); // Actualiza cada 60 segundos

    return () => clearInterval(timer); // Limpia el intervalo al desmontar
  }, []);

  return (
    <div className="calendar-crm">
      <div className="calendar-crm-inner-wrap">
        <div className="calendar-crm-scrollable">
          {/* HEADER: sincronizado horizontalmente */}
          <div className="calendar-crm-header" ref={headerRef}>
            {days.map((day, i) => (
              <div className="calendar-crm-day-col" key={i}>
                <ul className="activity-days-list">
                  <li>
                    {day.format('dddd')}
                    <span>{day.format('DD.MM.YYYY')}</span>
                  </li>
                </ul>
                <div className="daily-activity-crm">
                  <div className="staff-list-wrap">
                    <ul className="staff-list">
                      {users.map((m, j) => (
                        <li key={j}>
                          <div
                            className="media-staff"
                            data-tooltip-id="tooltip-component"
                            data-tooltip-content={m.name}
                            data-tooltip-place="top"
                          >
                            <div className="media-staff-body">
                              <h6 className="short-name-staff">{m.abb}</h6>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BODY: scroll vertical y horizontal */}
          <div className="calendar-crm-body" ref={bodyRef}>
            {days.map((day, i) => (
              <div className="day-col-body" key={i}>
                <div className="calendar-grid-outer-wrap">
                  <div className="calendar-grid">
                    <div className="calendar-content">
                      {users.map((m, j) => (
                        <div className="calendar-column" key={j} id={`calendar-column-${j}`}>
                          {events
                            .filter((event) => {
                              const eventStart = dayjs(event.start).utc().subtract(5, 'hours');
                              const eventEnd = dayjs(event.end).utc().subtract(5, 'hours');
                              const dayStart = day.startOf('day').utc().subtract(5, 'hours');
                              const dayEnd = day.endOf('day').utc().subtract(5, 'hours');

                              // El evento debe empezar antes del final del día Y terminar después del inicio del día
                              return (
                                eventStart.isBefore(dayEnd) &&
                                eventEnd.isAfter(dayStart) &&
                                event.user_abb === m.abb // Esta línea debe ser una comparación exacta
                              );
                            })
                            .map((event) => {
                              const startTime = dayjs(event.start);
                              const endTime = dayjs(event.end);

                              // Calcula la posición en formato decimal como la hora actual
                              const startHourDecimal = startTime.hour() + startTime.minute() / 60;
                              const endHourDecimal = endTime.hour() + endTime.minute() / 60;

                              // Calcula la posición superior en rem (igual que la hora actual)
                              const startTopRem = (startHourDecimal - startHour) * hourHeightRem;
                              const endTopRem = (endHourDecimal - startHour) * hourHeightRem;
                              const heightRem = endTopRem - startTopRem;

                              const color = event.color || '#f0f0f0';
                              return (
                                <div
                                  key={event.model_uuid}
                                  className="crm-card-event"
                                  style={{
                                    top: `${startTopRem}rem`,
                                    height: `${heightRem}rem`,
                                    //backgroundColor: color,
                                  }}
                                  onMouseEnter={(e) => handleMouseEnter(e, event.model_uuid)}
                                  onMouseLeave={handleMouseLeave}
                                  onClick={() => onEvent(event)}
                                >
                                  <div className="crm-card-event-bg" />
                                  <div className="crm-card-event-body">
                                    <div className="crm-card-event-description">
                                      <span className="crm-booking-name">{event.title}</span>
                                      <span className="booking-time">
                                        <div className="title_state_time">
                                          <span className="crm-card-time">
                                            {startTime.format('hh:mm A')} :{' '}
                                            {endTime.format('hh:mm A')}
                                          </span>
                                        </div>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          <div className="calendar-grid-body">
                            {timeSlots.map((time, i) => (
                              <div key={i} className="hour-line-crm"></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TIMELINE: sólo scroll vertical */}
          <div className="calendar-crm-timeline" ref={timelineRef}>
            <div className="time-data-inner-wrap">
              {currentHourDecimal >= startHour && currentHourDecimal <= endHour && (
                <div className="current-time-wrap" style={{ height: `${topPositionRem}rem` }}>
                  <div className="blue-line" />
                  <div className="current-time">
                    <span>{now.format('HH:mm')}</span>
                    <div className="current-time-line" />
                  </div>
                </div>
              )}
              <div className="calendar-crm-sessions">
                {timeSlots.map((time, i) => (
                  <div className="session-item" key={i}>
                    <span>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {tooltipPosition.visible &&
        (() => {
          const event = events.find((e) => e.model_uuid == tooltipPosition.eventId);
          if (!event) return null;

          const startTime = dayjs(event.start);
          const endTime = dayjs(event.end);
          const eventColor = event.color || '#f0f0f0';

          return (
            <div
              className="event-tooltip"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translateX(-50%)',
                position: 'fixed',
                zIndex: 9999,
              }}
            >
              <div className="tooltip-color-border" />
              <div className="tooltip-time-column">
                <span>{startTime.format('hh:mm A')}</span>
                <span>{endTime.format('hh:mm A')}</span>
              </div>
              <div className="tooltip-info-column">
                <div className="tooltip-title">{event.title}</div>
                <div className="tooltip-date">{startTime.format('DD.MM.YY')}</div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default WeeklyCalendar;
