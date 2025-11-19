/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../../utilities';
import { ChangeEvent, useState } from 'react';
import { ColorPicker } from '../../../../components/shared/ColorPicker';
import { FIELD_LIMITS, getMaxLengthMessage } from '../../../../constants/validation';

interface Props {
  data: any;
  storeLabel: any;
  updateLabel: any;
}

export const LabelFormComponent = (props: Props) => {
  const formData = props.data.row || {
    name: '',
    color: '#06B6D4',
    type_label_id: '',
  };

  const [errors, setErrors] = useState<any>({});

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(FIELD_LIMITS.label.name, getMaxLengthMessage('la etiqueta', FIELD_LIMITS.label.name))
      .required('El nombre de la etiqueta es obligatorio'),
    color: Yup.string().required('El color es obligatorio'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      if (props.data.type === 'store') {
        props
          .storeLabel(formik.values.name, formik.values.color)
          .then(() => {
            SweetAlert.success('Mensaje', 'Etiqueta creada correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
          });
      } else if (props.data.type == 'edit') {
        props
          .updateLabel(props.data.row.id, formik.values.name, formik.values.color)
          .then(() => {
            SweetAlert.success('Mensaje', 'Etiqueta actualizada correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
          });
      }
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const sanitizedValue = value.slice(0, FIELD_LIMITS.label.name);
    formik.setFieldValue(name, sanitizedValue);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body" style={{ height: '100vh' }}>
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
              maxLength={FIELD_LIMITS.label.name}
              className={`form-control form-control-sm todo-mayuscula ${
                formik.touched.name && formik.errors.name ? 'is-invalid' : ''
              }`}
            />
            <ErrorValidate state={formik.errors.name} />
            <ErrorBackend errorsBackend={errors} name="label" />
          </div>

          {/* Selector de Color */}
          <div className="col-md-12 mb-3">
            <label className="form-label">
              Color <span className="text-danger">*</span>
            </label>
            <ColorPicker
              color={formik.values.color}
              onChange={(color: string) => formik.setFieldValue('color', color)}
            />
            {formik.touched.color && typeof formik.errors.color === 'string' && (
              <div className="text-danger small mt-1">{formik.errors.color}</div>
            )}
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

export default LabelFormComponent;
