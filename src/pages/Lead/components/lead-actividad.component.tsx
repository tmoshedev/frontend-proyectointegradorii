/**Moment */
import moment from 'moment';

import CalendarioDisponibilidad from '../../../components/shared/CalendarioDisponibilidad';
import { useEffect, useState } from 'react';
/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ActividadesListComponent from '../actividades-componentes/actividades-list.component';
import FormLeadActividadComponent from './form-lead-actividad.component';
import { useCalendarioActividades } from '../../../hooks';
/**Models */
import { AgendaDiaria } from '../../../models';
import { FormLeadActividadRequest } from '../../../models/requests';
import { SweetAlert } from '../../../utilities';
import { AppStore } from '../../../redux/store';
import { useSelector } from 'react-redux';

interface Props {
  changeHistorialView: (view: string) => void;
  setStateMenu: (state: string) => void;
}

function capitalizarPrimeraPalabra(texto: string) {
  if (!texto) return '';
  const lower = texto.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const LeadActividadComponent = (props: Props) => {
  const { lead } = useSelector((store: AppStore) => store.lead);
  const { getAgendaDiaria, postLeadActividad } = useCalendarioActividades();
  const [AgendaDiaria, setAgendaDiaria] = useState<AgendaDiaria[]>([]);

  const formActividad: FormLeadActividadRequest = {
    lead_id: lead.id,
    tipo_actividad: 'LLAMADA',
    titulo: '',
    fecha_inicial: moment().format('YYYY-MM-DD'),
    fecha_final: moment().format('YYYY-MM-DD'),
    hora_inicial: '',
    hora_final: '',
    disponibilidad: 'OCUPADO',
    ubicacion: '',
    check_actividad: false,
  };

  const validationSchema = Yup.object({
    fecha_inicial: Yup.date().required('Fecha inicial es requerida'),
    fecha_final: Yup.date()
      .required('Fecha final es requerida')
      .min(Yup.ref('fecha_inicial'), 'La fecha final debe ser mayor o igual a la fecha inicial'),
    hora_inicial: Yup.string().required('Hora inicial es requerida'),
    hora_final: Yup.string().required('Hora final es requerida'),
  });

  const formik = useFormik({
    initialValues: formActividad,
    validationSchema: validationSchema,
    onSubmit: () => {
      postLeadActividad(formik.values, true).then((response: any) => {
        if (response.success) {
          SweetAlert.success('Mensaje', response.message);
          props.setStateMenu('Notas');
          props.changeHistorialView('');
        }
      });
    },
  });

  const setTipoActividad = (tipo: string) => {
    formik.setFieldValue('tipo_actividad', tipo);
  };

  const handleAgendaDiaria = (fecha: string) => {
    getAgendaDiaria(fecha, true).then((response) => {
      setAgendaDiaria(response.agenda);
    });
  };

  useEffect(() => {
    const fecha = moment(formik.values.fecha_inicial).format('YYYY-MM-DD');
    getAgendaDiaria(fecha, true).then((response) => {
      setAgendaDiaria(response.agenda);
    });
  }, []);

  return (
    <div className="lead-actividad">
      <div className="lead-actividad__left">
        <form className="lead-actividad__left-container" onSubmit={formik.handleSubmit}>
          <div className="lead-actividad__left-content">
            <div className="lead-actividad__left-form">
              <div className="lead-actividad-form">
                <div className="lead-actividad-form-container">
                  <div className="lead-actividad-form-input">
                    <input
                      type="text"
                      className="form-control input-lead-actividad"
                      placeholder={capitalizarPrimeraPalabra(formik.values.tipo_actividad)}
                      value={formik.values.titulo}
                      onChange={formik.handleChange}
                      name="titulo"
                      id="titulo"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <ActividadesListComponent
                  tipoActividad={formik.values.tipo_actividad}
                  setTipoActividad={setTipoActividad}
                />
              </div>

              <FormLeadActividadComponent formik={formik} handleAgendaDiaria={handleAgendaDiaria} />
            </div>
          </div>
          <div className="lead-actividad__left-footer">
            <div className="lead-actividad__left-footer-right">
              <button className="btn btn-xs btn-outline-cancel me-2">Cancelar</button>
              <button type="submit" className="btn btn-xs btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="lead-actividad__right">
        <div className="h-100 position-relative" style={{ borderTop: 'none' }}>
          <CalendarioDisponibilidad
            fecha={moment.tz(formik.values.fecha_inicial, 'YYYY-MM-DD', 'America/Lima').toDate()}
            eventos={AgendaDiaria}
            formik={formik}
          />
        </div>
      </div>
    </div>
  );
};
export default LeadActividadComponent;
