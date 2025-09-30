import { useSelector } from 'react-redux';
/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
/**Utilities */
import { ErrorValidate } from '../../utilities';
/**Hooks */
import { useLogin } from '../../hooks';
/**Components */
import { LoadingState } from '../../components/shared';
/**Redux */
import { AppStore } from '../../redux/store';
/**Models */
import { Login } from '../../models';

export const LoginPage = () => {
  const loadingState = useSelector((store: AppStore) => store.loading);
  const { login } = useLogin();

  const formData: Login = {
    username: '',
    password: '',
  };

  const validationSchema = () =>
    Yup.object().shape({
      username: Yup.string().required("El campo 'usuario' es obligatorio."),
      password: Yup.string().required("El campo 'contraseña' es obligatorio."),
    });

  const formik = useFormik({
    initialValues: formData,
    validationSchema,
    onSubmit: () => {
      login(formik.values);
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event);
  };

  return (
    <div className="layout__auth">
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-xl-7 login_bs_validation b-center bg-size login-page"
            style={{ backgroundColor: '#fff' }}
          ></div>
          <div className="col-xl-5 p-0">
            <div className="login-card login-dark login-bg">
              <div style={{ width: '100%' }}>
                <div>
                  <a className="logo text-center" href="/">
                    <img className="for-dark" src="/images/logo.png" alt="logo" />
                  </a>
                </div>
                <div className="login-main">
                  <form className="theme-form" onSubmit={formik.handleSubmit}>
                    <h2 className="text-center">Bienvenidos!!!</h2>
                    <div className="form-group">
                      <label className="col-form-label">Usuario</label>
                      <input
                        onChange={handleInputChange}
                        autoComplete="off"
                        name="username"
                        id="username"
                        type="text"
                        placeholder="DNI ó Correo corporativo"
                        className={
                          'form-control' +
                          (formik.errors.username && formik.touched.username ? ' is-invalid' : '')
                        }
                      />
                      <ErrorValidate state={formik.errors.username} />
                    </div>
                    <div className="form-group">
                      <label className="col-form-label">Contraseña</label>
                      <div className="form-input position-relative">
                        <input
                          autoComplete="off"
                          onChange={handleInputChange}
                          name="password"
                          id="password"
                          type="password"
                          placeholder="*********"
                          className={
                            'form-control' +
                            (formik.errors.password && formik.touched.password ? ' is-invalid' : '')
                          }
                        />
                        <ErrorValidate state={formik.errors.password} />
                      </div>
                    </div>
                    <div className="form-group mb-0 checkbox-checked">
                      <div className="text-end mt-3">
                        <button className="btn btn-primary btn-block w-100" type="submit">
                          <i className="fe fe-arrow-right"></i> Ingresar
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 mb-0 text-center">Versión 1.0.0</p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loadingState.isLoading ? <LoadingState /> : null}
    </div>
  );
};

export default LoginPage;
