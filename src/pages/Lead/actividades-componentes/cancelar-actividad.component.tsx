/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SweetAlert } from '../../../utilities';
import { ChangeEvent } from 'react';
import { useCalendarioActividades } from '../../../hooks';

interface Props {
  data: any;
  changeHistorialView: (view: string) => void;
}

export const CancelarActividadComponent = (props: Props) => {
  const { postCancelarActividad } = useCalendarioActividades();
  const formData = {
    lead_activity_uuid: props.data.row.lead_activity_uuid,
    motivo: '',
  };

  const validationSchema = Yup.object({
    lead_activity_uuid: Yup.string().required('Campo requerido'),
    motivo: Yup.string().required('Campo requerido'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      postCancelarActividad(formik.values.lead_activity_uuid, formik.values.motivo, true)
        .then((response: any) => {
          SweetAlert.success('Mensaje', response.message);
          props.data.onCloseModalForm();
          props.changeHistorialView('');
        })
        .catch((error) => {
          SweetAlert.error(
            'Error',
            error.response?.data?.message || 'Error al cancelar la actividad'
          );
        });
    },
  });

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Motivo */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="motivo">
              Motivo<span className="text-danger">*</span>
            </label>
            <textarea
              onChange={handleTextAreaChange}
              value={formik.values.motivo ?? ''}
              name="motivo"
              id="motivo"
              rows={4}
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

export default CancelarActividadComponent;
