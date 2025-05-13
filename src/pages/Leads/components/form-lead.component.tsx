/* eslint-disable @typescript-eslint/no-explicit-any */

/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../utilities';
import { ChangeEvent, useEffect, useState } from 'react';
import { LeadFormRequest } from '../../../models/requests';
import { useLeads } from '../../../hooks';
import moment from 'moment';

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
    channel_id: '',
    names: '',
    last_names: '',
    cellphone: '',
    ciudad: '',
  };
  const [projects, setProjects] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  const validationSchema = Yup.object({
    project_id: Yup.string().required('Campo requerido'),
    channel_id: Yup.string().required('Campo requerido'),
    names: Yup.string().required('Campo requerido'),
    cellphone: Yup.string().required('Campo requerido'),
  });

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
              setErrors(error.response.data.errors);
            } else {
              SweetAlert.error('Error', 'Error al guardar el lead');
            }
          });
      }
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
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
          {/* Proyecto */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="level_id">
              Proyecto<span className="text-danger">*</span>
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
              className={'todo-mayuscula form-control form-control-sm'}
            />
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
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.cellphone && formik.touched.cellphone ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.cellphone} />
          </div>
          {/* Ciudad */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="ciudad">
              Ciudad
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.ciudad ?? ''}
              name="ciudad"
              id="ciudad"
              type="text"
              className={'todo-mayuscula form-control form-control-sm'}
            />
          </div>

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
