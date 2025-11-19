/* eslint-disable @typescript-eslint/no-explicit-any */

/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorValidate, SweetAlert } from '../../../utilities';
import { ChangeEvent, useEffect, useState } from 'react';
import { LeadFormRequest } from '../../../models/requests';
import { useLeads } from '../../../hooks';
import moment from 'moment';
import {
  FIELD_LIMITS,
  getMaxLengthMessage,
  sanitizeCellphoneValue,
} from '../../../constants/validation';

interface Props {
  data: any;
  onRefreshLeads: () => void;
}

export const LeadFormComponent = (props: Props) => {
  const { requirements, storeLead } = useLeads();
  const formData: LeadFormRequest = props.data.row || {
    date: moment().format('YYYY-MM-DD'),
    lead_state_id: '1',
    project_id: '',
    channel_id: '7',
    document_number: '',
    names: '',
    last_names: '',
    cellphone: '',
    city: '',
    price: '',
    info: '',
    advisor_state: 'LIBERADO',
    asignarme_lead: false,
    level_of_interest: 'FRIO',
    campaign_code: '',
  };
  const [projects, setProjects] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const rolActual = localStorage.getItem('rolActual') || '';

  const validationSchema = Yup.object({
    channel_id: Yup.string().required('Campo requerido'),
    document_number: Yup.string().max(
      FIELD_LIMITS.lead.documentNumber,
      getMaxLengthMessage('DNI', FIELD_LIMITS.lead.documentNumber)
    ),
    names: Yup.string()
      .max(FIELD_LIMITS.lead.names, getMaxLengthMessage('nombres', FIELD_LIMITS.lead.names))
      .required('Campo requerido'),
    last_names: Yup.string().max(
      FIELD_LIMITS.lead.lastNames,
      getMaxLengthMessage('apellidos', FIELD_LIMITS.lead.lastNames)
    ),
    city: Yup.string().max(
      FIELD_LIMITS.lead.city,
      getMaxLengthMessage('ciudad', FIELD_LIMITS.lead.city)
    ),
    cellphone: Yup.string()
      .max(FIELD_LIMITS.lead.cellphone, getMaxLengthMessage('celular', FIELD_LIMITS.lead.cellphone))
      .required('Campo requerido'),
  });

  const fieldMaxLengths: Record<string, number> = {
    document_number: FIELD_LIMITS.lead.documentNumber,
    names: FIELD_LIMITS.lead.names,
    last_names: FIELD_LIMITS.lead.lastNames,
    city: FIELD_LIMITS.lead.city,
    cellphone: FIELD_LIMITS.lead.cellphone,
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      if (props.data.type == 'STORE') {
        storeLead(formik.values, true)
          .then((response: any) => {
            SweetAlert.success('Éxito', 'Lead guardado correctamente');
            props.onRefreshLeads();
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            if (error.response) {
              const backendMessage =
                error.response.data?.message ||
                error.response.data?.errors?.lead?.[0] ||
                'Error al guardar el lead';
              SweetAlert.warning('Mensaje', backendMessage);
              setErrors(error.response.data.errors);
            } else {
              SweetAlert.error('Error', 'Error al guardar el lead');
            }
          });
      }
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const limit = fieldMaxLengths[name];
    const sanitizedValue =
      name === 'cellphone'
        ? sanitizeCellphoneValue(value)
        : limit
        ? value.slice(0, limit)
        : value;
    formik.setFieldValue(name, sanitizedValue);
  };

  const handleInputChangeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  useEffect(() => {
    const dataInicial = () => {
      requirements(true).then((response: any) => {
        setProjects(response.projects);
        setChannels(response.channels);
      });
    };

    dataInicial();
  }, []);

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/*Nivel de interés*/}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="level_of_interest">
              Nivel de interés
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.level_of_interest ?? ''}
              name="level_of_interest"
              id="level_of_interest"
              className="form-select form-select-sm"
            >
              <option value="FRIO">Frío</option>
              <option value="CALIENTE">Caliente</option>
              <option value="TIBIO">Tíbio</option>
            </select>
          </div>
          {/* Proyecto */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="level_id">
              Proyecto
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.project_id ?? ''}
              name="project_id"
              id="project_id"
              className={
                'form-select form-select-sm' +
                (formik.errors.project_id && formik.touched.project_id ? ' is-invalid' : '')
              }
            >
              <option value="">Seleccionar</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <ErrorValidate state={formik.errors.project_id} />
          </div>
          {/* Canal */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="channel_id">
              Canal de captación<span className="text-danger">*</span>
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.channel_id ?? ''}
              name="channel_id"
              id="channel_id"
              className={
                'form-select form-select-sm' +
                (formik.errors.channel_id && formik.touched.channel_id ? ' is-invalid' : '')
              }
            >
              <option value="">Seleccionar</option>
              {channels?.map((channel: any) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
            <ErrorValidate state={formik.errors.channel_id} />
          </div>
          {/* Dni */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="document_number">
              Dni
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.document_number ?? ''}
              name="document_number"
              id="document_number"
              type="text"
              maxLength={FIELD_LIMITS.lead.documentNumber}
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.document_number && formik.touched.document_number
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.document_number} />
          </div>
          {/* Nombres */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="names">
              Nombres<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.names ?? ''}
              name="names"
              id="names"
              type="text"
              maxLength={FIELD_LIMITS.lead.names}
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.names && formik.touched.names ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.names} />
          </div>
          {/* Apellidos */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="last_names">
              Apellidos
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.last_names ?? ''}
              name="last_names"
              id="last_names"
              type="text"
              maxLength={FIELD_LIMITS.lead.lastNames}
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.last_names && formik.touched.last_names ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.last_names} />
          </div>
          {/* Celular */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="cellphone">
              Celular<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.cellphone ?? ''}
              name="cellphone"
              id="cellphone"
              type="text"
              maxLength={FIELD_LIMITS.lead.cellphone}
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.cellphone && formik.touched.cellphone ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.cellphone} />
          </div>
          {/* Ciudad */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="city">
              Ciudad
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.city ?? ''}
              name="city"
              id="city"
              type="text"
              maxLength={FIELD_LIMITS.lead.city}
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.city && formik.touched.city ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.city} />
          </div>

          {/*Asignarme lead a mi usuario*/}
          {(rolActual == 'COMMERCIAL_LEADER' || rolActual == 'SALES_SUPERVISOR') && (
            <div className="col-md-12 mb-3">
              <div className="form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="asignarme_lead"
                  name="asignarme_lead"
                  checked={formik.values.asignarme_lead}
                  onChange={formik.handleChange}
                />
                <label className="form-check-label" htmlFor="asignarme_lead">
                  Asignarme lead a mi usuario
                </label>
              </div>
            </div>
          )}

          <div className="col-md-12 mt-2" style={{ fontSize: '10px' }}>
            <span className="text-danger">*</span>
            <span>Campos obligatorios</span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-light btn-sm"
          data-bs-dismiss="modal"
          onClick={props.data.onCloseModalForm}
        >
          Cerrar
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          {props.data.buttonSubmit}
        </button>
      </div>
    </form>
  );
};

export default LeadFormComponent;
