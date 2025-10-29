/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorValidate, SweetAlert } from '../../../../utilities';

interface Props {
  data: any;
  createRole: any;
  getRoles: any;
}

export const RolFormComponent = (props: Props) => {
  const formData = {
    code: '',
    name: '',
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: Yup.object({
      code: Yup.string().required('El código es obligatorio'),
      name: Yup.string().required('El nombre es obligatorio'),
    }),
    onSubmit: () => {
      props
        .createRole(formik.values)
        .then(() => {
          SweetAlert.success('Mensaje', 'Rol creado correctamente.');
          props.getRoles(1, "", "", true);
          props.data.onCloseModalForm();
        })
        .catch((error: any) => {
          console.error('Error creando rol:', error);
        });
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Código */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="code">
              Código<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.code ?? ''}
              name="code"
              id="code"
              type="text"
              className={
                'form-control form-control-sm' +
                (formik.errors.code && formik.touched.code ? ' is-invalid' : '')
              }
              placeholder="Ej. SALES_AGENT"
            />
            <ErrorValidate state={formik.errors.code} />
          </div>

          {/* Nombre */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="name">
              Nombre<span className="text-danger">*</span>
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
              placeholder="Ej. AGENTE DE VENTAS"
            />
            <ErrorValidate state={formik.errors.name} />
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

export default RolFormComponent;