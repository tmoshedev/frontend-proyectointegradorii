/* eslint-disable @typescript-eslint/no-explicit-any */

/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../utilities';
import { ChangeEvent, useState } from 'react';
import { useUserHierarchy } from '../../../hooks';
/**Moment */
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';
import { AccessUser, Person } from '../../../models';
/**Select */
import Select from 'react-select';

interface Props {
  data: any;
  onRefreshTeams: () => void;
  findPerson: (document_number: string, loanding: boolean) => any;
  findUbigeo: (text: string, loanding: boolean) => any;
}

interface OptionSelect {
  label: string;
  value: string;
}

export const AddUserComponent = (props: Props) => {
  const [isLoadingDomilicio, setIsLoadingDomilicio] = useState(false);
  const [optionsDomilicio, setOptionsDominilio] = useState<OptionSelect[]>([]);
  const { storeUserHierarchy } = useUserHierarchy();
  const [errors, setErrors] = useState<any>({});
  const formData: AccessUser = {
    document_number: '',
    names: '',
    father_last_name: '',
    mother_last_name: '',
    cellphone: '',
    role_id: '',
    ubigeo_domicilio: '',
    direccion: '',
    fecha_nacimiento: '',
    genero: '',
    selectedUbigeoDomilicio: { label: 'Buscar ciudad...', value: '' },
    roles: [],
    superior_id: props.data.row?.user_id || '',
  };

  const validationSchema = Yup.object({
    document_number: Yup.string().required('El número de documento es obligatorio'),
    names: Yup.string().required('El nombre es obligatorio'),
    father_last_name: Yup.string().required('El apellido paterno es obligatorio'),
    mother_last_name: Yup.string().required('El apellido materno es obligatorio'),
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    onSubmit: () => {
      storeUserHierarchy(formik.values, true)
        .then((response: any) => {
          SweetAlert.success('Mensaje', response.message);
          props.data.onCloseModalForm();
          props.onRefreshTeams();
        })
        .catch((error: any) => {
          setErrors(error.response.data.errors);
        });
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  const handleInputChangeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  const onKeyUpSearchPerson = () => {
    if (formik.values.document_number.length == 8) {
      props.findPerson(formik.values.document_number, true).then((response: Person) => {
        if (response) {
          formik.setFieldValue('names', response.names);
          formik.setFieldValue('father_last_name', response.father_last_name);
          formik.setFieldValue('mother_last_name', response.mother_last_name);
          formik.setFieldValue('direccion', response.address);
          formik.setFieldValue('ubigeo_domicilio', response.ubigeo_id);
          formik.setFieldValue('selectedUbigeoDomilicio', response.selectedUbigeo);
          formik.setFieldValue('fecha_nacimiento', response.fecha_nacimiento);
          formik.setFieldValue('genero', response.sexo);
        }
      });
    }
  };

  const handleDomicilioSelectChange = (selectedOption: OptionSelect) => {
    setOptionsDominilio([]);
    formik.setFieldValue('ubigeo_domicilio', selectedOption.value);
    formik.setFieldValue('selectedUbigeoDomilicio', selectedOption);
  };

  const handleSearchDomicilio = (value: string) => {
    if (value.length >= 3) {
      props
        .findUbigeo(value, false)
        .then((response: any) => {
          setIsLoadingDomilicio(true);
          setOptionsDominilio(response.data);
        })
        .finally(() => {
          setIsLoadingDomilicio(false);
        });
    }
  };

  const handleDateChange = (date: Date[]) => {
    const birth_date = moment(date[0]).format('YYYY-MM-DD');
    formik.setFieldValue('fecha_nacimiento', birth_date);
  };

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Rol */}
          {props.data.type == 'store' && (
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="role_id">
                Rol<span className="text-danger">*</span>
              </label>
              <select
                onChange={handleInputChangeSelect}
                value={formik.values.role_id ?? ''}
                name="role_id"
                id="role_id"
                className={
                  'form-select form-select-sm' +
                  (formik.errors.role_id && formik.touched.role_id ? ' is-invalid' : '')
                }
              >
                <option value="">Seleccionar</option>
                {props.data.requirements?.roles?.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ErrorValidate state={formik.errors.role_id} />
            </div>
          )}
          {/* Número de documento */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="document_number">
              Número de documento<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              onKeyUp={onKeyUpSearchPerson}
              value={formik.values.document_number ?? ''}
              name="document_number"
              id="document_number"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.document_number && formik.touched.document_number
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.document_number} />
          </div>
          {/* Nombres */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="names">
              Nombres<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.names ?? ''}
              name="names"
              id="names"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.names && formik.touched.names ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.names} />
            <ErrorBackend errorsBackend={errors} name="user" />
          </div>
          {/* Apellido paterno */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="father_last_name">
              Apellido paterno<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.father_last_name ?? ''}
              name="father_last_name"
              id="father_last_name"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.father_last_name && formik.touched.father_last_name
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.father_last_name} />
          </div>
          {/* Apellido materno */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="mother_last_name">
              Apellido materno<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.mother_last_name ?? ''}
              name="mother_last_name"
              id="mother_last_name"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.mother_last_name && formik.touched.mother_last_name
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.mother_last_name} />
          </div>
          {/* Celular */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="cellphone">
              Celular
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.cellphone ?? ''}
              name="cellphone"
              id="cellphone"
              type="text"
              className="form-control form-control-sm"
            />
          </div>
          {/* Ciudad de domicilio [Ciudad / Provincia / Departamento] */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="student_ubigeo_domicilio">
              Ciudad de domicilio [Ciudad / Provincia / Departamento]
            </label>
            <Select
              name="student_ubigeo_domicilio"
              id="student_ubigeo_domicilio"
              isLoading={isLoadingDomilicio}
              placeholder={'Buscar ciudad...'}
              options={optionsDomilicio}
              noOptionsMessage={() => 'No se encontraron resultados'}
              value={formik.values.selectedUbigeoDomilicio}
              onChange={(selectedOption) => handleDomicilioSelectChange(selectedOption)}
              onInputChange={handleSearchDomicilio}
            />
          </div>
          {/* Domicilio */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="direccion">
              Domicilio
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.direccion ?? ''}
              name="direccion"
              id="direccion"
              type="text"
              className="todo-mayuscula form-control form-control-sm"
            />
          </div>
          {/* Fecha de nacimiento */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="fecha_nacimiento">
              Fecha de nacimiento
            </label>
            <Flatpickr
              name="student_fecha_nacimiento"
              id="student_fecha_nacimiento"
              value={formik.values.fecha_nacimiento}
              onChange={handleDateChange}
              className="form-control form-control-sm"
              options={{
                dateFormat: 'Y-m-d',
                locale: 'es',
              }}
            />
          </div>
          {/* Género */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="genero">
              Género
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.genero ?? ''}
              name="genero"
              id="genero"
              className="form-select form-select-sm"
            >
              <option value="">Seleccionar</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
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

export default AddUserComponent;
