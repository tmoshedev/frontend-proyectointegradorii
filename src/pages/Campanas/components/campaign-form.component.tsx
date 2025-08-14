/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../utilities';
import { ChangeEvent, useState } from 'react';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';

interface Props {
  data: any;
  storeCampaign: any;
  updateCampaign: any;
}

export const CampaignFormComponent = (props: Props) => {
  const formData = props.data.row || {
    name: '',
    fecha_inicio: '',
    precio: '',
    codigo: '',
    channel_id: '',
    state: '',
  };

  const [errors, setErrors] = useState<any>({});

  const getValidationSchema = (type: string) => {
      return Yup.object({
    name: Yup.string().required('El nombre de la campaña es obligatorio'),
    fecha_inicio: Yup.date().required('La fecha de inicio es obligatoria'),
    codigo: Yup.string().required('El código es obligatorio'),
    channel_id: Yup.string().required('El canal es obligatorio'),
  });
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: getValidationSchema(props.data.type),
    onSubmit: () => {
      if (props.data.type === 'store') {
        props
          .storeCampaign(formik.values)
          .then(() => {
            SweetAlert.success('Mensaje', 'Campaña creada correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
          });
      } else if (props.data.type == 'edit') {
        props
          .updateCampaign(formik.values)
          .then(() => {
            SweetAlert.success('Mensaje', 'Campaña actualizada correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
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

  const handleDateChange = (date: Date[]) => {
    const fecha = moment(date[0]).format('YYYY-MM-DD');
    formik.setFieldValue('fecha_inicio', fecha);
  };

  const generarCodigo = () => {
    const randomCode = 'ALI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    formik.setFieldValue('codigo', randomCode);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Nombre de campaña */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="name">
              Nombre de campaña<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.name ?? ''}
              name="name"
              id="name"
              type="text"
              className={
                'form-control form-control-sm' +
                (formik.errors.name && formik.touched.name ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.name} />
          </div>

          {/* Fecha de inicio */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="fecha_inicio">
              Fecha de inicio<span className="text-danger">*</span>
            </label>
            <Flatpickr
              name="fecha_inicio"
              id="fecha_inicio"
              value={formik.values.fecha_inicio}
              onChange={handleDateChange}
              className={
                'form-control form-control-sm' +
                (formik.errors.fecha_inicio && formik.touched.fecha_inicio ? ' is-invalid' : '')
              }
              options={{
                dateFormat: 'Y-m-d',
                locale: 'es',
              }}
            />
            <ErrorValidate state={formik.errors.fecha_inicio} />
          </div>

          {/* Precio */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="precio">
              Precio
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.precio ?? ''}
              name="precio"
              id="precio"
              type="number"
              step="0.01"
              className={
                'form-control form-control-sm' +
                (formik.errors.precio && formik.touched.precio ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.precio} />
          </div>

          {/* Código con botón para generar */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="codigo">
              Código<span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                autoComplete="off"
                onChange={handleInputChange}
                value={formik.values.codigo ?? ''}
                name="codigo"
                id="codigo"
                type="text"
                className={
                  'form-control form-control-sm' +
                  (formik.errors.codigo && formik.touched.codigo ? ' is-invalid' : '')
                }
              />
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={generarCodigo}
              >
                Generar
              </button>
            </div>
            <ErrorValidate state={formik.errors.codigo} />
          </div>

          {/* Canal */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="channel_id">
              Canal<span className="text-danger">*</span>
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
              <option value="">Seleccionar canal</option>
              {props.data.requirements?.channels?.map((ch: any) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
            <ErrorValidate state={formik.errors.channel_id} />
          </div>

          {/* Estado */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="state">
              Estado
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.state ?? ''}
              name="state"
              id="state"
              className="form-select form-select-sm"
            >
              <option value={1}>Recepcionar Leads</option>
              <option value={0}>No recepcionar Leads</option>
            </select>
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

export default CampaignFormComponent;
