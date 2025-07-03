/* eslint-disable @typescript-eslint/no-explicit-any */

/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorValidate, SweetAlert } from '../../../utilities';
import { ChangeEvent } from 'react';
import { useLeads } from '../../../hooks';

interface Props {
  data: any;
  updateLeadLocal: (lead: any) => void;
}
export const LeadAsesorEditComponent = (props: Props) => {
  const { updateLeadAsesor } = useLeads();
  const formData = props.data.row;
  const rolActual = localStorage.getItem('rolActual') || '';

  const validationSchema = Yup.object({
    assigned_to: Yup.string().required('Campo requerido'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      updateLeadAsesor(formData.lead_uuid, formik.values.assigned_to, true).then(
        (response: any) => {
          SweetAlert.success('Mensaje', 'Asesor actualizado correctamente');
          props.data.onCloseModalForm();
          props.updateLeadLocal(response.lead);
        }
      );
      //props.onRefreshLeads();
    },
  });

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Asesor/Supervisor */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="level_id">
               {rolActual === 'COMMERCIAL_LEADER' ? 'Supervisor' : 'Asesor'}<span className="text-danger">*</span>
            </label>
            <select
              onChange={handleSelectChange}
              value={formik.values.assigned_to ?? ''}
              name="assigned_to"
              id="assigned_to"
              className={
                'form-select form-select-sm' +
                (formik.errors.assigned_to && formik.touched.assigned_to ? ' is-invalid' : '')
              }
            >
              <option value="">Seleccionar</option>
              {props.data.requirements.users?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <ErrorValidate state={formik.errors.assigned_to} />
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

export default LeadAsesorEditComponent;
