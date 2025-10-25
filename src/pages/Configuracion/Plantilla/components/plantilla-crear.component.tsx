import { useEffect, useState, type ChangeEvent } from 'react';
import { usePdfTemplates, useProjects } from '../../../../hooks';
/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../../utilities';

interface Props {
  data: any;
  addItem: (item: any) => void;
}
export const PlantillaCrearComponent = (props: Props) => {
  const [projects, setProjects] = useState<any[]>([]);
  const { getProjects } = useProjects();
  const { createPdfTemplate } = usePdfTemplates();
  const [errors, setErrors] = useState<any>({});

  const formData = props.data.row || {
    type_project_name: '',
    name: '',
    type: '',
    project_id: '',
    state: 'PUBLICADO',
    header: null,
    content: null,
    footer: null,
  };

  const getValidationSchema = () => {
    return Yup.object({
      name: Yup.string().required('El nombre es obligatorio'),
      type: Yup.string().required('El tipo es obligatorio'),
    });
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: getValidationSchema(),
    onSubmit: () => {
      createPdfTemplate(formik.values, true)
        .then((response: any) => {
          SweetAlert.success('Mensaje', response.message);
          props.addItem(response.pdf_template);
          props.data.onCloseModalForm();
        })
        .catch((error: any) => {
          setErrors(error.response.data.errors);
        });
    },
  });

  const handleChangeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.name === 'project_id') {
      const projectCurrent = projects.find((item) => item.id == event.target.value);
      const typeProjectName = projectCurrent?.type_project_name || '';
      formik.setFieldValue('type_project_name', typeProjectName);
      formik.setFieldValue('stage_block_id', '');
      
    }

    formik.setFieldValue(event.target.name, event.target.value);
  };

  useEffect(() => {
    const dataInicial = () => {
      getProjects('', '', 'get', 0, '', 'name', 'asc', true, false).then((response: any) => {
        setProjects(response.data);
      });
    };

    dataInicial();
  }, []);

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/*NOMBRE DE LA PLANTILLA*/}
          <div className="col-md-12 mb-2">
            <label className="form-label" htmlFor="name">
              Nombre de la Plantilla<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              type="text"
              id="name"
              name="name"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.name && formik.touched.name ? ' is-invalid' : '')
              }
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <ErrorValidate state={formik.errors.name} />
            <ErrorBackend errorsBackend={errors} name="pdf_template" />
          </div>
          {/*TIPO DE PLANTILLA*/}
          <div className="col-md-12 mb-2">
            <label className="form-label" htmlFor="type">
              Tipo de Plantilla<span className="text-danger">*</span>
            </label>
            <select
              onChange={handleChangeSelect}
              value={formik.values.type ?? ''}
              name="type"
              id="type"
              className={
                'form-select form-select-sm' +
                (formik.errors.type && formik.touched.type ? ' is-invalid' : '')
              }
            >
              <option value="">Seleccione un tipo</option>
             {/* <option value="RESERVA">RESERVA</option>*/}
              <option value="BUYER">BUYER</option> 
            </select>
            <ErrorValidate state={formik.errors.type} />
          </div>
          {/* Proyecto solo si tipo es RESERVA */}
          {formik.values.type === 'RESERVA' && (
            <div className="col-md-12 mb-2">
              <label className="form-label" htmlFor="project_id">
                Proyecto<span className="text-danger">*</span>
              </label>
              <select
                onChange={handleChangeSelect}
                value={formik.values.project_id ?? ''}
                name="project_id"
                id="project_id"
                className={
                  'form-select form-select-sm' +
                  (formik.errors.project_id && formik.touched.project_id ? ' is-invalid' : '')
                }
              >
                <option value="">Todos los proyectos</option>
                {projects.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.type_project_name}
                  </option>
                ))}
              </select>
              <ErrorValidate state={formik.errors.project_id} />
            </div>
          )}
          {/*Etapa o Bloque 
          {formik.values.project_id && (
            <div className="col-md-12 mb-3">
              <label className="form-label" htmlFor="stage_block_id">
                {esLote ? 'Etapa' : 'Bloque'}
                <span className="text-danger">*</span>
              </label>
              <select
                onChange={handleChangeSelect}
                value={formik.values.stage_block_id ?? ''}
                name="stage_block_id"
                id="stage_block_id"
                className={
                  'form-select form-select-sm' +
                  (formik.errors.stage_block_id && formik.touched.stage_block_id
                    ? ' is-invalid'
                    : '')
                }
              >
                <option value="">{esLote ? 'Todas las etapas' : 'Todos los bloques'}</option>
                {stagesBlocks.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ErrorValidate state={formik.errors.stage_block_id} />
            </div>
          )}*/}
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

export default PlantillaCrearComponent;
