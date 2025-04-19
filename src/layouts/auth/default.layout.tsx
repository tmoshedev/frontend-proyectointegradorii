// DefaultLayout.tsx
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { AppStore } from '../../redux/store';
import Sidebar from '../../components/sidebar';
import Header from '../../components/header';
import { LoadingState } from '../../components/shared';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';

const DefaultLayout = () => {
  const loadingState = useSelector((store: AppStore) => store.loading);
  const location = useLocation();

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
      <ToastContainer />
      <Header openToggled={openToggled} />
      <Sidebar />
      <Outlet />
      <div onClick={closeSidebar} id="responsive-overlay"></div>
      {loadingState.isLoading && <LoadingState />}
    </>
  );
};

export default DefaultLayout;
