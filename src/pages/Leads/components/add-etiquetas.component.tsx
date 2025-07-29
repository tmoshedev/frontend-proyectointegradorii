/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ChangeEvent, useState } from 'react';
import { ColorPicker } from '../../../components/shared/ColorPicker';
import { useLabels } from '../../../hooks';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../utilities';

interface Props {
  data: any;
  labels: any[];
  setLabels: (labels: any[]) => void;
}

export const AddEtiquetasComponent = (props: Props) => {
  const [errors, setErrors] = useState<any>({});
  const { storeLabel } = useLabels();
  const formData = {
    name: '',
    color: '#06B6D4',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Campo requerido'),
    color: Yup.string().required('Campo requerido'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      storeLabel(formik.values.name, formik.values.color, true)
        .then((response: any) => {
          props.setLabels([...props.labels, { ...response.label, checked: false }]);
          props.data.onCloseModalForm();
          SweetAlert.success('Mensaje', 'Etiqueta guardada correctamente');
        })
        .catch((error: any) => {
          setErrors(error.response.data.errors);
        });
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
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
            {formik.touched.color && formik.errors.color && (
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

export default AddEtiquetasComponent;
