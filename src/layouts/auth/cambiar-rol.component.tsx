import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/store';

interface Props {
  data: any;
}
export const CambiarRolComponent = (props: Props) => {
  const userState = useSelector((state: AppStore) => state.auth.user);
  const rolActualName = localStorage.getItem('rolActualName') || '';

  const onCambiarRol = (role: any) => {
    localStorage.setItem('rolActual', role.code);
    localStorage.setItem('rolActualName', role.name);
    window.location.reload();
  };

  return (
    <div className="form-scrollable">
      <div className="modal-body">
        <div className="row">
          {userState.roles.map((role: any) => (
            <div className="col-4" key={role.code} onClick={() => onCambiarRol(role)}>
              <div
                className={`card card-cambiar-rol ${rolActualName === role.name ? 'active' : ''}`}
              >
                <div className="card-body text-center">
                  <p className="p-0 m-0 rol-icon">
                    <i className="fa-regular fa-user"></i>
                  </p>
                  <p className="p-0 m-0 rol-text">{role.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CambiarRolComponent;
