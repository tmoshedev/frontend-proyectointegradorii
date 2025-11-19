// DefaultLayout.tsx
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { AppStore } from '../../redux/store';
import Sidebar from '../../components/sidebar';
import Header from '../../components/header';
import { LoadingState } from '../../components/shared';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import ModalComponent from '../../components/shared/modal.component';
import CambiarRolComponent from './cambiar-rol.component';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any[];
  onCloseModalForm: any;
}

const DefaultLayout = () => {
  const loadingState = useSelector((store: AppStore) => store.loading);
  const userState = useSelector((store: AppStore) => store.auth.user);
  const location = useLocation();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onCambiarRol = () => {
    setDataModalResourceState({
      type: 'CAMBIAR_ROL',
      buttonSubmit: 'Cambiar',
      row: null,
      title: 'Cambiar Rol',
      requirements: [],
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  const closeSidebar = () => {
    const html = document.documentElement;
    const overlay = document.getElementById('responsive-overlay');
    html.setAttribute('data-toggled', 'close');
    overlay?.classList.remove('active');
  };

  const openToggled = () => {
    const html = document.documentElement;
    const overlay = document.getElementById('responsive-overlay');

    if (window.innerWidth > 991) {
      const isIconOverlayClose = html.getAttribute('data-toggled') === 'icon-overlay-close';
      html.setAttribute(
        'data-toggled',
        isIconOverlayClose ? 'icon-overlay-open' : 'icon-overlay-close'
      );
    } else {
      const isOpen = html.getAttribute('data-toggled') === 'open';
      html.setAttribute('data-toggled', isOpen ? 'close' : 'open');
      overlay?.classList.toggle('active', !isOpen);
    }
  };

  // Lógica de DefaultLayout para el menú, que se instala solo si no se ha forzado el cierre
  useEffect(() => {
    const html = document.documentElement;
    // Si se ha forzado el cierre (desde otra página), no instalamos la lógica de DefaultLayout
    if (html.getAttribute('data-force-close') === 'true') {
      return;
    }

    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.getElementById('responsive-overlay');

    const handleMouseEnter = () => {
      if (html.getAttribute('data-toggled') === 'icon-overlay-close') {
        html.setAttribute('data-icon-overlay', 'open');
      }
    };

    const handleMouseLeave = () => {
      if (html.getAttribute('data-toggled') === 'icon-overlay-close') {
        html.removeAttribute('data-icon-overlay');
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 991) {
        html.setAttribute('data-toggled', 'icon-overlay-open');
        overlay?.classList.remove('active');
        sidebar?.addEventListener('mouseenter', handleMouseEnter);
        sidebar?.addEventListener('mouseleave', handleMouseLeave);
      } else {
        html.setAttribute('data-toggled', 'close');
        html.removeAttribute('data-icon-overlay');
        sidebar?.removeEventListener('mouseenter', handleMouseEnter);
        sidebar?.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      sidebar?.removeEventListener('mouseenter', handleMouseEnter);
      sidebar?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [location.pathname]);

  // Cerrar el menú en mobile al navegar (esto aplica globalmente)
  useEffect(() => {
    if (window.innerWidth <= 991) {
      closeSidebar();
    }
  }, [location.pathname]);

  return (
    <>
      <Tooltip id="tooltip-component" place="bottom" style={{ zIndex: 9999 }} html={undefined} />
      <ToastContainer />
      <Header openToggled={openToggled} onCambiarRol={onCambiarRol} />
      {userState?.pendingRoleAssignment ? (
        <main className="main-content app-content">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-xxl-6 col-xl-7 col-lg-8 col-md-9">
                <div className="card text-center my-5">
                  <div className="card-body py-5">
                    <i className="ri-shield-keyhole-line display-4 text-warning mb-3"></i>
                    <h4 className="fw-bold mb-3">Rol en espera de asignación</h4>
                    <p className="text-muted mb-4">
                      Tu rol actual fue deshabilitado. Mientras un administrador te asigna un nuevo rol, no podrás acceder a los módulos del sistema.
                    </p>
                    <p className="text-muted mb-4">
                      Si crees que se trata de un error, comunícate con el equipo de soporte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <Sidebar />
          <Outlet />
          <div onClick={closeSidebar} id="responsive-overlay"></div>
        </>
      )}
      {loadingState.isLoading && <LoadingState />}

      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-lg"
          content={<CambiarRolComponent data={dataModalResourceState} />}
        />
      )}
    </>
  );
};

export default DefaultLayout;
