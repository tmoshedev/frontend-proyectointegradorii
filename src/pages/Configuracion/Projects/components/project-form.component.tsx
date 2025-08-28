/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../../utilities';
import { ChangeEvent, useState } from 'react';
// import { ColorPicker } from '../../../../components/shared/ColorPicker';

interface Props {
  data: any;
  storeProject: any;
  updateProject: any;
}

export const ProjectFormComponent = (props: Props) => {
  const formData = props.data.row || {
    name: '',
    image: '',
    type_project_id: '',
  };

  const [errors, setErrors] = useState<any>({});

  const validationSchema = Yup.object({
    name: Yup.string().required('El nombre del proyecto es obligatorio'),
    image: Yup.mixed().required('La imagen es obligatoria'),
  });

  const [preview, setPreview] = useState<string | null>(null);
  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      if (props.data.type === 'store') {
        props
          .storeProject(formik.values.name, formik.values.image)
          .then(() => {
            SweetAlert.success('Mensaje', 'Proyecto creado correctamente.');
            props.data.onCloseModalForm();
          })
          .catch((error: any) => {
            setErrors(error.response.data.errors);
          });
      } else if (props.data.type == 'edit') {
        props
          .updateProject(props.data.row.id, formik.values.name, formik.values.image)
          .then(() => {
            SweetAlert.success('Mensaje', 'Proyecto actualizado correctamente.');
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files as FileList;
    const image = selectedFiles?.[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      formik.setFieldValue("image", e.target?.result);
    };

    reader.readAsDataURL(image);
  };


  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body" style={{ height: '50vh' }}>
        <div className="row">
          {/* Nombre */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="name">
              Nombre del proyecto<span className="text-danger">*</span>
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
            <ErrorBackend errorsBackend={errors} name="name" />
          </div>

          {/**IMAGEN */}
          <div className="form-group col-md-12">
            {props.data.type == "store" ? (
              <label htmlFor="image" className="form-label">
                Imagen <span className="text-danger">*</span>
              </label>
            ) : (
              <label htmlFor="image" className="form-label">
                Actualizar imagen
              </label>
            )}
            <input
              id="image"
              name="image"
              onChange={handleFileChange}
              type="file"
              accept="image/*"
              className={
                "form-control form-control-sm" +
                (formik.errors.image && formik.touched.image ? " is-invalid" : "")
              }
            />
            <ErrorValidate state={formik.errors.image} />
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

export default ProjectFormComponent;
