/**DatePicker */
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';
/**Moment */
import moment from 'moment';

import { CalendarCog, Clock3, Ellipsis, Info, ListTodo, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ErrorValidate } from '../../../utilities';
interface Props {
  formik: any; // Formik instance
  handleAgendaDiaria: (hora: string) => void; // Función para actualizar la agenda diaria
}
export const FormLeadActividadComponent = (props: Props) => {
  const [location, setlocation] = useState<boolean>(false);
  const generarHoras = () => {
    const horas: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = moment({ hour: h, minute: m }).format('hh:mm A');
        horas.push(hora);
      }
    }
    return horas;
  };
  const generarHorasFinales = (horaInicio: string) => {
    const horas: string[] = [];
    if (!horaInicio) return horas;
    // Parsear la hora de inicio
    let inicio = moment(horaInicio, 'hh:mm A');
    // Si la hora no es válida, retornar vacío
    if (!inicio.isValid()) return horas;
    // Sumar 5 minutos para la primera opción
    inicio = inicio.add(5, 'minutes');
    const fin = moment({ hour: 23, minute: 55 });
    while (inicio.isSameOrBefore(fin)) {
      horas.push(inicio.format('hh:mm A'));
      inicio = inicio.add(5, 'minutes');
    }
    return horas;
  };

  //Hora final
  const horasDisponiblesFinal = generarHorasFinales(props.formik.values.start_time);

  //Hora inicio
  const horasDisponibles = generarHoras();
  const [activeHoraInicio, setActiveHoraInicio] = useState<boolean>(false);
  const [busquedaHora, setBusquedaHora] = useState('');

  const [activeHoraFinal, setActiveHoraFinal] = useState<boolean>(false);
  const [busquedaHoraFinal, setBusquedaHoraFinal] = useState('');

  const onChangeDate = (date: Date, field: string) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    props.formik.setFieldValue(field, formattedDate);
    if (field === 'start_date') {
      // Si se cambia la fecha inicial, actualizar la fecha final para que sea igual
      props.formik.setFieldValue('end_date', formattedDate);
      // También actualizar la agenda diaria
      props.handleAgendaDiaria(formattedDate);
    }
  };

  return (
    <>
      {/* Fecha y hora */}
      <div className="lead-actividad-form">
        <div className="lead-actividad-form-icon mt-1">
          <Clock3
            height={18}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Fecha y hora de la actividad'}
          />
        </div>
        <div className="lead-actividad-form-times">
          <span>
            <Flatpickr
              key={props.formik.values.start_date || 'default'} // 👈 fuerza recreación
              value={
                props.formik.values.start_date
                  ? moment(props.formik.values.start_date).toDate()
                  : undefined
              }
              onChange={([date]) => onChangeDate(date, 'start_date')}
              className="form-control form-control-sm input-lead-actividad"
              options={{
                altInput: true,
                altFormat: 'F j, Y',
                dateFormat: 'Y-m-d',
                locale: 'es',
              }}
            />
          </span>
          <span>
            <div className="" style={{ position: 'relative' }}>
              <input
                autoComplete="off"
                type="text"
                placeholder="Hora inicio..."
                className={
                  'form-control form-control-sm input-lead-actividad' +
                  (props.formik.errors.start_time && props.formik.touched.start_time
                    ? ' is-invalid'
                    : '')
                }
                value={props.formik.values.start_time || busquedaHora}
                onChange={(e) => {
                  setBusquedaHora(e.target.value);
                  props.formik.setFieldValue('start_time', '');
                }}
                onFocus={() => setActiveHoraInicio(true)}
                onBlur={() => setActiveHoraInicio(false)}
              />
              <ErrorValidate state={props.formik.errors.start_time} />
              {(props.formik.values.start_time || busquedaHora) && (
                <button
                  type="button"
                  onClick={() => {
                    props.formik.setFieldValue('start_time', '');
                    props.formik.setFieldValue('end_time', '');
                    setBusquedaHora('');
                    setBusquedaHoraFinal('');
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '16px',
                    color: '#999',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  &times;
                </button>
              )}
            </div>
            {activeHoraInicio && (
              <div
                className="position-absolute select-dos-dropdown select-dos-edit-asesor"
                style={{ width: '150px', maxHeight: '210px' }}
              >
                <ul className="select-dos-dropdown_options">
                  {horasDisponibles
                    .filter((hora) => hora.toLowerCase().includes(busquedaHora.toLowerCase()))
                    .map((hora, index) => (
                      <li
                        key={index}
                        className="select-dos-dropdown_option"
                        onMouseDown={() => {
                          props.formik.setFieldValue('start_time', hora);
                          props.formik.setFieldValue('end_time', '');
                          setBusquedaHora('');
                          setActiveHoraInicio(false);
                          setBusquedaHoraFinal('');
                        }}
                      >
                        {hora}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </span>
          -
          <span>
            <div className="" style={{ position: 'relative' }}>
              <input
                autoComplete="off"
                disabled={!props.formik.values.start_time}
                type="text"
                placeholder="Hora final..."
                className={
                  'form-control form-control-sm input-lead-actividad' +
                  (props.formik.errors.end_time && props.formik.touched.end_time
                    ? ' is-invalid'
                    : '')
                }
                value={props.formik.values.end_time || busquedaHoraFinal}
                onChange={(e) => {
                  setBusquedaHora(e.target.value);
                  props.formik.setFieldValue('end_time', '');
                }}
                onFocus={() => setActiveHoraFinal(true)}
                onBlur={() => setActiveHoraFinal(false)}
              />
              <ErrorValidate state={props.formik.errors.end_time} />
              {(props.formik.values.end_time || busquedaHoraFinal) && (
                <button
                  type="button"
                  onClick={() => {
                    props.formik.setFieldValue('end_time', '');
                    setBusquedaHoraFinal('');
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '16px',
                    color: '#999',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  &times;
                </button>
              )}
            </div>
            {activeHoraFinal && (
              <div
                className="position-absolute select-dos-dropdown select-dos-edit-asesor"
                style={{ width: '180px', maxHeight: '210px' }}
              >
                <ul className="select-dos-dropdown_options">
                  {horasDisponiblesFinal
                    .filter((hora) => hora.toLowerCase().includes(busquedaHoraFinal.toLowerCase()))
                    .map((hora, index) => {
                      // Calcular la diferencia respecto a la hora de inicio
                      const inicio = moment(props.formik.values.start_time, 'hh:mm A');
                      const fin = moment(hora, 'hh:mm A');
                      const diffMin = fin.diff(inicio, 'minutes');
                      let diffLabel = '';
                      if (diffMin < 60) {
                        diffLabel = `(+${diffMin} min)`;
                      } else if (diffMin % 60 === 0) {
                        diffLabel = `(+${diffMin / 60}h)`;
                      } else {
                        diffLabel = `(+${Math.floor(diffMin / 60)}h ${diffMin % 60}min)`;
                      }
                      return (
                        <li
                          key={index}
                          className="select-dos-dropdown_option"
                          onMouseDown={() => {
                            props.formik.setFieldValue('end_time', hora);
                            setBusquedaHoraFinal('');
                            setActiveHoraFinal(false);
                          }}
                        >
                          {hora}
                          <span
                            className="diff-label ms-1"
                            style={{ color: '#888', fontSize: '0.85em' }}
                          >
                            {diffLabel}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </span>
          <span>
            <Flatpickr
              key={props.formik.values.end_date || 'default'} // 👈 fuerza recreación
              value={
                props.formik.values.end_date
                  ? moment(props.formik.values.end_date).toDate()
                  : undefined
              }
              onChange={([date]) => {
                props.formik.setFieldValue('end_date', moment(date).format('YYYY-MM-DD'));
              }}
              className="form-control form-control-sm input-lead-actividad"
              options={{
                locale: 'es',
                altInput: true,
                altFormat: 'F j, Y', // Esto es lo que el usuario ve
                dateFormat: 'Y-m-d', // Esto es lo que internamente usa flatpickr
                minDate: props.formik.values.start_date,
              }}
            />
          </span>
        </div>
      </div>

      {/*Libre/Ocupado*/}
      <div className="lead-actividad-form">
        <div className="lead-actividad-form-icon mt-1">
          <CalendarCog
            height={18}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Libre o ocupado'}
          />
        </div>
        <div className="d-flex align-items-center">
          <div style={{ minWidth: '30%' }} className="me-1">
            <select
              value={props.formik.values.availability}
              name="availability"
              id="availability"
              className="form-control form-select form-control-sm input-lead-actividad"
              onChange={props.formik.handleChange}
            >
              <option value="OCUPADO">Ocupado</option>
              <option value="LIBRE">Libre</option>
            </select>
          </div>
          <Info
            data-tooltip-id="tooltip-component"
            data-tooltip-content={
              'Esta opción controla si apareces como disponible o no disponible para otras reuniones al mismo tiempo.'
            }
            height={18}
            role="button"
          />
        </div>
      </div>

      {/* Configuracion*/}
      {!location && (
        <div className="lead-actividad-form">
          <div className="lead-actividad-form-icon">
            <Ellipsis height={18} />
          </div>
          <div className="d-flex align-items-center">
            <span>Agregar</span>
            <span
              onClick={() => setlocation(true)}
              role="button"
              className="ms-2 text-primary agregar-ubicacion"
            >
              ubicación
            </span>
          </div>
        </div>
      )}

      {/* Ubicación*/}
      {location && (
        <div className="lead-actividad-form">
          <div className="lead-actividad-form-icon mt-1">
            <MapPin
              data-tooltip-id="tooltip-component"
              data-tooltip-content={'Ubicación'}
              height={18}
            />
          </div>
          <div className="d-flex align-items-center">
            <input
              type="text"
              placeholder="Ubicación"
              className="form-control form-control-sm input-lead-actividad"
              name="location"
              id="location"
              value={props.formik.values.location || ''}
              onChange={props.formik.handleChange}
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {/* Marcar como completada*/}
      <div className="lead-actividad-form">
        <div className="lead-actividad-form-icon mt-1">
          <ListTodo
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Marcar como completada'}
            height={18}
          />
        </div>
        <div className="d-flex align-items-center">
          <div className="form-check mt-1">
            <input
              className="form-check-input"
              type="checkbox"
              id="check_actividad"
              name="check_actividad"
              checked={props.formik.values.check_actividad || false}
              onChange={props.formik.handleChange}
            />
            <label className="form-check-label" htmlFor="check_actividad">
              Marcar como actividad completada
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormLeadActividadComponent;
