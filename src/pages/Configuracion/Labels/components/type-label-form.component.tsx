/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../../utilities';
import { ChangeEvent, useState } from 'react';
import { ColorPicker } from '../../../../components/shared/ColorPicker';

interface Props {
  data: any;
  storeTypeLabel: any;
  updateTypeLabel: any;
  onRefresh: () => void;
}

export const TypeLabelFormComponent = (props: Props) => {
  const formData = props.data.row || {
    name: '',
  };

  const [errors, setErrors] = useState<any>({});

  const validationSchema = Yup.object({
    name: Yup.string().required('El nombre del Tipo de etiqueta es obligatorio'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      if (props.data.type === 'store') {
        props
          .storeTypeLabel(formik.values.name)
          .then(() => {
            SweetAlert.success('Mensaje', 'Tipo de Etiqueta creada correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
          });
      } else if (props.data.type == 'edit') {
        props
          .updateTypeLabel(props.data.row.id, formik.values.name)
          .then(() => {
            SweetAlert.success('Mensaje', 'Tipo de Etiqueta actualizada correctamente.');
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

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body" style={{ height: '20vh' }}>
        <div className="row">
          {/* Nombre */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="name">
              Nombre de la etiqueta<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.name ?? ''}
              name="name"
              id="name"
              type="text"
              className={`form-control form-control-sm todo-mayuscula ${
                formik.touched.name && formik.errors.name ? 'is-invalid' : ''
              }`}
            />
            <ErrorValidate state={formik.errors.name} />
            <ErrorBackend errorsBackend={errors} name="label" />
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

export default TypeLabelFormComponent;
