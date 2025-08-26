import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AgendaDiaria } from '../../models';
import { iconsActividades } from '../../utilities/iconsActividades.utilily';
import moment from 'moment-timezone';
import 'moment/dist/locale/es';
moment.locale('es');

interface CalendarioDisponibilidadProps {
  fecha: Date;
  eventos?: AgendaDiaria[];
  formik: any;
}

export default function CalendarioDisponibilidad({
  fecha,
  eventos = [],
  formik,
}: CalendarioDisponibilidadProps) {
  const [ahora, setAhora] = useState(() => moment.tz('America/Lima'));
  const eventoTemporalRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: AgendaDiaria | null;
    position: { x: number; y: number };
  }>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const contenedorScrollRef = useRef<HTMLDivElement>(null);
  const lineaAhoraRef = useRef<HTMLDivElement>(null);
  const [eventosFiltrados, setEventosFiltrados] = useState<AgendaDiaria[]>(eventos);

  useEffect(() => {
    const timerId = setInterval(() => setAhora(moment.tz('America/Lima')), 60000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (lineaAhoraRef.current && contenedorScrollRef.current) {
      setTimeout(() => {
        const offsetTop = lineaAhoraRef.current!.offsetTop;
        contenedorScrollRef.current!.scrollTop =
          offsetTop - contenedorScrollRef.current!.clientHeight / 3;
      }, 100);
    }
  }, []);

  const calcularPosicion = (fecha: moment.Moment) => {
    const minutosDesdeMedianoche = fecha.hours() * 60 + fecha.minutes();
    return (minutosDesdeMedianoche / (24 * 60)) * 100;
  };

  const formatearFechaHeader = (fechaObj: Date) => {
    return moment.tz(fechaObj, 'America/Lima').locale('es').format('dddd, D [de] MMMM');
  };

  const formatearHoraActual = (fecha: moment.Moment) => {
    return fecha.format('h:mm a');
  };

  const formatearHora = (fecha: moment.Moment) => {
    return fecha.format('h:mm a');
  };

  const horasDelDia = Array.from({ length: 24 }, (_, i) => {
    const hora = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hora} ${ampm}`;
  });

  const posicionAhora = calcularPosicion(ahora);
  const alturaTotal = 60 * 24; // 60px * 24 horas

  useEffect(() => {
    const { fecha_inicial, fecha_final, hora_inicial, hora_final } = formik.values;
    let nuevosEventos = eventos.filter((evento) => evento.save !== false);

    if (fecha_inicial && fecha_final && hora_inicial && hora_final) {
      // Agrega el nuevo evento temporal
      const fechaInicio = moment.tz(
        `${fecha_inicial} ${hora_inicial}`,
        'YYYY-MM-DD hh:mm A',
        'America/Lima'
      );
      const fechaFin = moment.tz(
        `${fecha_final} ${hora_final}`,
        'YYYY-MM-DD hh:mm A',
        'America/Lima'
      );
      const nuevoEvento: AgendaDiaria = {
        start: fechaInicio.toDate(),
        end: fechaFin.toDate(),
        title: formik.values.titulo == '' ? formik.values.tipo_actividad : formik.values.titulo,
        activity_name: formik.values.tipo_actividad,
        model_type: '',
        model_id: '',
        fecha_actividad: '',
        fecha_fin_actividad: '',
        hora_inicio: '',
        hora_fin: '',
        save: false,
      };
      nuevosEventos = [...nuevosEventos, nuevoEvento];
    }

    setEventosFiltrados(nuevosEventos);
  }, [
    eventos,
    formik.values.fecha_inicial,
    formik.values.fecha_final,
    formik.values.hora_inicial,
    formik.values.hora_final,
    formik.values.titulo,
    formik.values.tipo_actividad,
  ]);

  useEffect(() => {
    // Busca el evento temporal (save: false)
    const tieneTemporal = eventosFiltrados.some((e) => e.save === false);
    if (tieneTemporal && eventoTemporalRef.current && contenedorScrollRef.current) {
      // Hace scroll al evento temporal
      contenedorScrollRef.current.scrollTop = eventoTemporalRef.current.offsetTop - 60;
    }
  }, [eventosFiltrados]);

  const handleMouseEnter = (evento: AgendaDiaria, e: React.MouseEvent) => {
    setTooltip({
      visible: true,
      content: evento,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      content: null,
      position: { x: 0, y: 0 },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip((t) => ({ ...t, position: { x: e.clientX, y: e.clientY } }));
    }
  };

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <div style={{ marginRight: 'auto' }}>{formatearFechaHeader(fecha)}</div>
        <div className="calendario-header__buttons">
          <button className="me-2 btn btn-light btn-xs">
            <ChevronLeft height={15} />
          </button>
          <button className="btn btn-light btn-xs">
            <ChevronRight height={15} />
          </button>
        </div>
      </div>
      <div className="calendario-body" ref={contenedorScrollRef}>
        <div className="timeline" style={{ height: `${alturaTotal}px` }}>
          {horasDelDia.map((hora, index) => (
            <div key={index} className="timeline-hora">
              {hora}
            </div>
          ))}
        </div>
        <div className="calendario-grid" style={{ height: `${alturaTotal}px` }}>
          {horasDelDia.map((_, index) => (
            <div key={index} className="grid-line" style={{ top: `${index * 60 + 20}px` }} />
          ))}

          {/* Línea actual */}
          <div
            ref={lineaAhoraRef}
            className="linea-ahora"
            style={{ top: `${(posicionAhora * alturaTotal) / 100 + 20}px` }}
          >
            <div className="hora-actual-contenedor">
              <div className="hora-texto-izquierda">{formatearHoraActual(ahora)}</div>
              <div className="punto-ahora"></div>
            </div>
            <div className="linea-roja"></div>
          </div>

          {/* Tooltip */}
          {tooltip.visible && tooltip.content && (
            <div
              className="event-tooltip"
              style={{
                left: `${tooltip.position.x}px`,
                top: `${tooltip.position.y + 10}px`,
                transform: 'translateX(-50%)',
                position: 'fixed',
                zIndex: 9999,
                pointerEvents: 'none', // Para que el tooltip no interfiera con el ratón
              }}
            >
              <div className="tooltip-color-border" />
              <div className="tooltip-time-column">
                <span>{moment.tz(tooltip.content.start, 'America/Lima').format('hh:mm A')}</span>
                <span>{moment.tz(tooltip.content.end, 'America/Lima').format('hh:mm A')}</span>
              </div>
              <div className="tooltip-info-column">
                <div className="tooltip-title">{tooltip.content.title}</div>
                <div className="tooltip-date">
                  {moment.tz(tooltip.content.start, 'America/Lima').format('DD.MM.YY')}
                </div>
              </div>
            </div>
          )}

          {/* Eventos */}
          {eventosFiltrados.map((evento, index) => {
            const inicio = moment.tz(evento.start, 'America/Lima');
            const fin = moment.tz(evento.end, 'America/Lima');
            const top = calcularPosicion(inicio);
            const height = calcularPosicion(fin) - top;
            const esTemporal = evento.save === false;

            return (
              <div
                key={index}
                className={`evento ${esTemporal ? ' evento-temporal' : ''}`}
                ref={esTemporal ? eventoTemporalRef : undefined}
                onMouseEnter={(e) => handleMouseEnter(evento, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                style={{
                  top: `${(top * alturaTotal) / 100 + 20}px`,
                  height: `${(height * alturaTotal) / 100}px`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="evento-titulo">
                    {iconsActividades(14)[evento.activity_name]} {evento.title}

                  </span>
                  <span style={{ fontSize: '0.75em' }}>
                    {formatearHora(inicio)} → {formatearHora(fin)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
