/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SimpleBarReact from 'simplebar-react';
import { NavLink, useLocation } from 'react-router-dom';
/**Resources */
import Menu from '../resources/menu';
import CanCheck from '../resources/can';
import { useEffect, useState } from 'react';
import { AppStore } from '../redux/store';
import { useSelector } from 'react-redux';

const showSection = (permissions: any[]) => {
  let rpta = false;
  permissions.forEach((permission) => {
    if (CanCheck(permission)) {
      rpta = true;
    }
  });
  return rpta;
};

export const Sidebar = () => {
  const location = useLocation();
  const collapse: { [key: string]: boolean } = {};
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const userState = useSelector((state: AppStore) => state.auth.user);

  // Verificar si la ruta actual pertenece a un submenú
  useEffect(() => {
    Menu.forEach((menuItem) => {
      if (
        menuItem.submenu &&
        menuItem.submenu.some((subMenuItem) => subMenuItem.path === location.pathname)
      ) {
        setActiveMenu(menuItem.name); // Activa el menú principal del submenú
      }
    });
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const buildCollapseList = () => {
    Menu.forEach(({ name, permission, permissions, submenu }) => {
      let count = 0;

      !submenu && CanCheck(permission) && (collapse[name] = false);

      if (submenu && showSection(permissions ?? [])) {
        submenu.forEach(({ path }) => {
          count = path == location.pathname ? count + 1 : count;
        });
        collapse[name] = count == 0 ? false : true;
      }
    });
  };

  buildCollapseList();

  const validateCollapse = (item: any) => {
    return collapse[item.name];
  };

  const getInitials = () => {
    if (userState.names && userState.father_last_name) {
      return `${userState.names.charAt(0)}${userState.father_last_name.charAt(0)}`;
    }
    return 'U'; // Si no hay datos, usa 'U' por defecto
  };

  return (
    <aside className="app-sidebar sticky" id="sidebar">
      <div className="main-sidebar-header">
        <a href="/" className="header-logo">
          <img src="/images/logo-blanco.png" alt="logo" className="desktop-white" />
          <img src="/images/icon-blanco.png" alt="logo" className="toggle-white" />
        </a>
      </div>
      <SimpleBarReact className="main-sidebar" id="sidebar-scroll">
        <div className="app-sidebar__user">
          <div className="dropdown user-pro-body text-center">
            <div className="user-pic">
              {userState?.photo ? (
                <img
                  src={`data:image/jpg;base64,${userState.photo}`}
                  alt={userState.names + ' ' + userState.father_last_name}
                  className="avatar avatar-xl avatar-rounded mb-0"
                />
              ) : (
                <div className="text-center d-inline-block">
                  <div
                    className="avatar user-avatar user-avatar-menu mb-0"
                    style={{ width: '4ream', height: '4ream' }}
                  >
                    {getInitials()}
                  </div>
                </div>
              )}
            </div>
            <div className="user-info text-center">
              <h5 className=" mb-1 fw-bold">{userState.names}</h5>
              <span className="text-muted app-sidebar__user-name text-sm">
                {userState.roles[0].name}
              </span>
            </div>{' '}
          </div>{' '}
        </div>
        <nav className="main-menu-container nav nav-pills flex-column sub-open active">
          <ul className="main-menu">
            {Menu.map((menuItem, index) => (
              <li
                className={`slide ${menuItem.submenu ? 'has-sub' : ''} ${
                  activeMenu === menuItem.name ? 'open' : ''
                }`}
                key={index}
              >
                {!menuItem.submenu && CanCheck(menuItem.permission) && (
                  <NavLink
                    to={menuItem.path}
                    className={({ isActive }) => `side-menu__item ${isActive ? 'active' : ''}`}
                    onClick={() => toggleMenu(menuItem.name)}
                  >
                    <i className={`${menuItem.icon} side-menu__icon`}></i>
                    <span className="side-menu__label">{menuItem.name}</span>
                  </NavLink>
                )}

                {menuItem.submenu && showSection(menuItem.permissions ?? []) && (
                  <>
                    <a
                      onClick={() => toggleMenu(menuItem.name)}
                      role="button"
                      className={
                        validateCollapse(menuItem ?? '')
                          ? 'side-menu__item active'
                          : 'side-menu__item'
                      }
                    >
                      <i className={`${menuItem.icon} side-menu__icon`}></i>
                      <span className="side-menu__label">{menuItem.name}</span>
                      <i className="ri-arrow-right-s-line side-menu__angle"></i>
                    </a>

                    <ul
                      className="slide-menu child1"
                      style={{ display: activeMenu === menuItem.name ? 'block' : 'none' }}
                    >
                      {menuItem.submenu.map(
                        (subMenuItem, subIndex) =>
                          CanCheck(subMenuItem.permission) && (
                            <li className="slide" key={subIndex}>
                              <NavLink
                                className={({ isActive }) =>
                                  `side-menu__item ${isActive ? 'active' : ''}`
                                }
                                to={subMenuItem.path}
                              >
                                <span>{subMenuItem.name}</span>
                              </NavLink>
                            </li>
                          )
                      )}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="app-sidebar-help">
            <div className="text-center">
              <div className="help text-center">
                <a
                  href=""
                  className="nav-link p-0 help-dropdown my-auto d-inline-flex align-items-center"
                >
                  <span>VERSIÓN 1.0.0</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </SimpleBarReact>
    </aside>
  );
};

export default Sidebar;
