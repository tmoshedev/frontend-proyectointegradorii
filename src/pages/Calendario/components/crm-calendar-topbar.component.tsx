import React, { useCallback } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import moment from 'moment';

export type ViewType = 'DIA' | 'SEMANA' | 'MES';

interface Props {
  setFormData: (data: any) => void;
  formData: {
    type: ViewType;
    fecha_inicial: string;
    fecha_final: string;
  };
}

const DATE_FORMAT = 'YYYY-MM-DD';
const MONTH_FORMAT = 'YYYY-MM';

const getToday = () => moment().format(DATE_FORMAT);
const getWeekRange = (date = moment()) => ({
  monday: date.clone().startOf('isoWeek').format(DATE_FORMAT),
  sunday: date.clone().endOf('isoWeek').format(DATE_FORMAT),
});
const getMonthRange = (date = moment()) => ({
  startOfMonth: date.clone().startOf('month').format(DATE_FORMAT),
  endOfMonth: date.clone().endOf('month').format(DATE_FORMAT),
});

export const CrmCalendarTopbarComponent = ({ setFormData, formData }: Props) => {
  const onChangeType = useCallback(
    (type: ViewType) => {
      if (type === 'DIA') {
        setFormData((prev: any) => ({
          ...prev,
          fecha_inicial: getToday(),
          fecha_final: getToday(),
          type,
        }));
      } else if (type === 'SEMANA') {
        const { monday, sunday } = getWeekRange();
        setFormData((prev: any) => ({
          ...prev,
          fecha_inicial: monday,
          fecha_final: sunday,
          type,
        }));
      } else if (type === 'MES') {
        const { startOfMonth, endOfMonth } = getMonthRange();
        setFormData((prev: any) => ({
          ...prev,
          fecha_inicial: startOfMonth,
          fecha_final: endOfMonth,
          type,
        }));
      }
    },
    [setFormData]
  );

  const cambiarSemana = (delta: number) => {
    const base = moment(formData.fecha_inicial).add(delta, 'week');
    const { monday, sunday } = getWeekRange(base);
    setFormData((prev: any) => ({
      ...prev,
      fecha_inicial: monday,
      fecha_final: sunday,
    }));
  };

  const cambiarDia = (delta: number) => {
    const fecha = moment(formData.fecha_inicial).add(delta, 'day').format(DATE_FORMAT);
    setFormData((prev: any) => ({
      ...prev,
      fecha_inicial: fecha,
      fecha_final: fecha,
    }));
  };

  const cambiarMes = (delta: number) => {
    const base = moment(formData.fecha_inicial).add(delta, 'month');
    const { startOfMonth, endOfMonth } = getMonthRange(base);
    setFormData((prev: any) => ({
      ...prev,
      fecha_inicial: startOfMonth,
      fecha_final: endOfMonth,
    }));
  };

  return (
    <div className="crm-calendar-topbar">
      <div style={{ width: '12rem' }}>
        <select
          onChange={(e) => onChangeType(e.target.value as ViewType)}
          value={formData.type}
          name="type"
          id="type"
          className="form-select form-select-sm"
        >
          <option value="DIA">Día</option>
          <option value="SEMANA">Semana</option>
          <option value="MES">Mes</option>
        </select>
      </div>

      {formData.type === 'SEMANA' && (
        <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <i
              role="button"
              onClick={() => cambiarSemana(-1)}
              className="fa-solid fa-chevron-left"
            ></i>
            <div style={{ width: '17rem' }}>
              <Flatpickr
                key={`${formData.fecha_inicial}-${formData.fecha_final}`}
                value={
                  formData.fecha_inicial && formData.fecha_final
                    ? [
                        moment(formData.fecha_inicial).toDate(),
                        moment(formData.fecha_final).toDate(),
                      ]
                    : undefined
                }
                onChange={([start]) => {
                  const { monday, sunday } = getWeekRange(moment(start));
                  setFormData((prev: any) => ({
                    ...prev,
                    fecha_inicial: monday,
                    fecha_final: sunday,
                  }));
                }}
                className="form-control form-control-sm input-lead-actividad"
                options={{
                  mode: 'range',
                  locale: 'es',
                  altInput: true,
                  altFormat: 'd \\de F Y',
                  dateFormat: 'Y-m-d',
                }}
              />
            </div>
            <i
              role="button"
              onClick={() => cambiarSemana(1)}
              className="fa-solid fa-chevron-right"
            ></i>
          </div>
          <span className="text-primary" role="button" onClick={() => onChangeType('SEMANA')}>
            Mostrar semana actual
          </span>
        </div>
      )}

      {formData.type === 'DIA' && (
        <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <i
              role="button"
              onClick={() => cambiarDia(-1)}
              className="fa-solid fa-chevron-left"
            ></i>
            <div style={{ width: '17rem' }}>
              <Flatpickr
                key={formData.fecha_inicial}
                value={formData.fecha_inicial ? moment(formData.fecha_inicial).toDate() : undefined}
                onChange={([date]) => {
                  const selected = moment(date).format(DATE_FORMAT);
                  setFormData((prev: any) => ({
                    ...prev,
                    fecha_inicial: selected,
                    fecha_final: selected,
                  }));
                }}
                className="form-control form-control-sm input-lead-actividad"
                options={{
                  locale: 'es',
                  altInput: true,
                  altFormat: 'd \\de F Y',
                  dateFormat: 'Y-m-d',
                }}
              />
            </div>
            <i
              role="button"
              onClick={() => cambiarDia(1)}
              className="fa-solid fa-chevron-right"
            ></i>
          </div>
        </div>
      )}

      {formData.type === 'MES' && (
        <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <i
              role="button"
              onClick={() => cambiarMes(-1)}
              className="fa-solid fa-chevron-left"
            ></i>
            <div style={{ width: '17rem' }}>
              <Flatpickr
                key={`${formData.fecha_inicial}-${formData.fecha_final}`}
                value={
                  formData.fecha_inicial
                    ? moment(formData.fecha_inicial).format(MONTH_FORMAT)
                    : undefined
                }
                onChange={([date]) => {
                  const { startOfMonth, endOfMonth } = getMonthRange(moment(date));
                  setFormData((prev: any) => ({
                    ...prev,
                    fecha_inicial: startOfMonth,
                    fecha_final: endOfMonth,
                  }));
                }}
                className="form-control form-control-sm input-lead-actividad"
                options={{
                  dateFormat: 'Y-m',
                  locale: 'es',
                  plugins: [
                    new (monthSelectPlugin as any)({
                      shorthand: true,
                      dateFormat: 'Y-m',
                      altFormat: 'F Y',
                    }),
                  ],
                  altInput: true,
                  altFormat: 'F Y',
                }}
              />
            </div>
            <i
              role="button"
              onClick={() => cambiarMes(1)}
              className="fa-solid fa-chevron-right"
            ></i>
          </div>
          <span className="text-primary" role="button" onClick={() => onChangeType('MES')}>
            Mostrar mes actual
          </span>
        </div>
      )}

      <div>
        <button className="button-filtro">
          <i className="fa-solid fa-filter"></i>
        </button>
      </div>
    </div>
  );
};

export default CrmCalendarTopbarComponent;
