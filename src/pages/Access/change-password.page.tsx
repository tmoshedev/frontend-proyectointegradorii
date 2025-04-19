/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useState } from 'react';
import { ErrorBackend } from '../../utilities';
import { useLogin } from '../../hooks';
import PageHeaderComponent from '../../components/page/page-hader.component';

export const ChangePasswordPage = () => {
  //STATE
  const state = {
    page: {
      title: 'Cambiar contraseña',
      model: 'classrooms',
      buttons: {
        create: false,
        edit: false,
        destroy: false,
        import: false,
        export: false,
      },
    },
  };

  const [errors, setErrors] = useState<any>([]);
  const [formData, setFormData] = useState({
    password_current: '',
    password: '',
    password_confirmation: '',
  });
  const { changePassword } = useLogin();

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updatePassword = async () => {
    changePassword(formData)
      .then(() => {})
      .catch((error: any) => {
        setErrors(error.response.data.errors);
      });
  };

  const hasError = (propertyName: string) => {
    return errors && errors[propertyName];
  };

  //METODOS DEL RECURSO

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <PageHeaderComponent state={state} onModalResource={() => null} />
              <div className="card-body pt-1">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="password_current" className="form-label">
                        Contraseña actual
                      </label>
                      <input
                        id="password_current"
                        name="password_current"
                        value={formData.password_current}
                        onChange={onChangeInput}
                        autoComplete="off"
                        type="password"
                        className={`form-control form-control-sm${
                          hasError(`password_current`) ? ' is-invalid' : ''
                        }`}
                      />
                      <ErrorBackend errorsBackend={errors} name={`password_current`} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Contraseña nueva
                      </label>
                      <input
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={onChangeInput}
                        autoComplete="off"
                        type="password"
                        className={`form-control form-control-sm${
                          hasError(`password`) ? ' is-invalid' : ''
                        }`}
                      />
                      <ErrorBackend errorsBackend={errors} name="password" />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="password_confirmation" className="form-label">
                        Confirmar contraseña nueva
                      </label>
                      <input
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={onChangeInput}
                        autoComplete="off"
                        type="password"
                        className={`form-control form-control-sm${
                          hasError(`password_confirmation`) ? ' is-invalid' : ''
                        }`}
                      />
                      <ErrorBackend errorsBackend={errors} name="password_confirmation" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer text-center">
                <button onClick={updatePassword} className="btn btn-primary">
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
