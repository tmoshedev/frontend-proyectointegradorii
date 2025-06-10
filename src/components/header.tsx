/**Hooks */

import { useSelector } from 'react-redux';
import { AppStore } from '../redux/store';
import { useLogin } from '../hooks';

interface HeaderProps {
  openToggled: () => void;
  onCambiarRol: () => void;
}

export const Header = (props: HeaderProps) => {
  const userState = useSelector((state: AppStore) => state.auth.user);
  const { handleLogout } = useLogin();
  const roleActualName = localStorage.getItem('rolActualName') || '';
  const logout = () => {
    handleLogout();
  };

  const getInitials = () => {
    if (userState.names && userState.father_last_name) {
      return `${userState.names.charAt(0)}${userState.father_last_name.charAt(0)}`;
    }
    return 'U'; // Si no hay datos, usa 'U' por defecto
  };

  return (
    <header className="app-header">
      <div className="main-header-container container-fluid">
        <div className="header-content-left">
          <div className="header-element">
            <div className="horizontal-logo">
              <a href="/" className="header-logo">
                <img src="/images/logo-blanco.png" alt="logo" className="desktop-logo" />
                <img src="/images/icon-blanco.png" alt="logo" className="toggle-white" />
              </a>
            </div>
          </div>
          <div className="header-element">
            <div className="sidemenu-toggle hor-toggle horizontal-navtoggle">
              <a
                onClick={props.openToggled}
                aria-label="anchor"
                className="open-toggle"
                role="button"
              >
                <svg
                  className="header-link-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </a>
              <a
                onClick={props.openToggled}
                aria-label="anchor"
                className="close-toggle"
                role="button"
              >
                <svg
                  className="header-link-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none"></path>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="header-content-right">
          <div className="header-element d-lg-flex">
            <a
              role="button"
              className="header-link dropdown-toggle"
              data-bs-auto-close="outside"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="nav-span">
                EMPRESA <i className="ri-arrow-down-s-line ms-1 fs-18"></i>
              </span>
            </a>
            <div className="main-header-dropdown dropdown-menu dropdown-menu-start">
              <a className="dropdown-item" role="button">
                EMPRESA
              </a>
            </div>
          </div>
          <div className="header-element main-profile-user">
            <a
              href="#"
              className="header-link dropdown-toggle"
              id="mainHeaderProfile"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
            >
              <div className="d-flex align-items-center">
                {userState?.photo ? (
                  <img
                    src={`data:image/jpg;base64,${userState.photo}`}
                    alt={userState.names + ' ' + userState.father_last_name}
                    className="rounded-circle header-profile-img avatar me-sm-2 me-0"
                  />
                ) : (
                  <div
                    className="user-avatar me-sm-2 me-0"
                    style={{ width: '32px', height: '32px' }}
                  >
                    {getInitials()}
                  </div>
                )}
                <div className="d-xl-block d-none align-items-center my-auto text-start">
                  <h6 className="fw-medium mb-0 lh-1 fs-13">{userState.names}</h6>
                  <span className="op-5 fw-normal d-block fs-11 lh-1">{roleActualName}</span>
                </div>
              </div>
            </a>
            <div
              className="main-header-dropdown dropdown-menu header-profile-dropdown dropdown-menu-end"
              aria-labelledby="mainHeaderProfile"
            >
              <ul className="list-unstyled mb-0">
                <li className="drop-heading d-xl-none d-block">
                  <div className="text-center">
                    <h5 className="text-dark mb-0 fs-16 fw-bold">{userState.names}</h5>
                    <small className="text-muted fs-12">{roleActualName}</small>
                  </div>
                </li>
                <li className="dropdown-item">
                  <a
                    onClick={() => props.onCambiarRol()}
                    className="d-flex align-items-center w-100"
                    role="button"
                  >
                    <i className="ri-loop-left-line me-3"></i> Cambiar Rol
                  </a>
                </li>
                <li className="dropdown-item">
                  <a
                    onClick={() => logout()}
                    className="d-flex align-items-center w-100"
                    role="button"
                  >
                    <i className="ri-shut-down-line profile-icon me-3"></i> Salir
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
