/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorValidate, SweetAlert } from '../../../../utilities';

interface Props {
  data: any;
  createRole: any;
  getRoles: any;
}

export const RolFormComponent = (props: Props) => {
  const initialValues = useMemo(
    () => ({
      name: '',
    }),
    [],
  );

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required('El nombre es obligatorio'),
    }),
    onSubmit: () => {
      const trimmedName = formik.values.name.trim();
      const normalizedCode = trimmedName
        .normalize('NFD')
        .replace(/[^\x00-\x7F]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, ' ')
        .trim()
        .replace(/\s+/g, '_');
      const roleCode = normalizedCode || `ROLE_${Date.now()}`;

      props
        .createRole({ code: roleCode, name: trimmedName })
        .then(() => {
          SweetAlert.success('Mensaje', 'Rol creado correctamente.');
          props.getRoles(1, "", "", true, true);
          props.data.onCloseModalForm();
        })
        .catch((error: any) => {
          console.error('Error creando rol:', error);
        });
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Nombre */}
          <div className="col-md-12 mb-3">
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
              placeholder="Ej. Agente de Ventas"
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