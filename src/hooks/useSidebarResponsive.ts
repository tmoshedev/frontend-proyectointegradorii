// useSidebarResponsive.ts
import { useEffect } from 'react';

export const useSidebarResponsive = (forceCloseSidebar: boolean = false) => {
  useEffect(() => {
    const html = document.documentElement;
    // Usamos el id "sidebar" porque en la plantilla se obtiene así
    const sidebar = document.getElementById('sidebar');

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
      if (forceCloseSidebar) {
        const overlay = document.getElementById('responsive-overlay');
        // Forzamos el menú cerrado sin eventos de hover
        if (window.innerWidth > 991) {
          html.setAttribute('data-toggled', 'icon-overlay-close');
          sidebar?.addEventListener('mouseenter', handleMouseEnter);
          sidebar?.addEventListener('mouseleave', handleMouseLeave);
          overlay?.classList.remove('active');
          return;
        } else {
          html.setAttribute('data-toggled', 'close');
          html.removeAttribute('data-icon-overlay');
          sidebar?.removeEventListener('mouseenter', handleMouseEnter);
          sidebar?.removeEventListener('mouseleave', handleMouseLeave);
          return;
        }
      }
      if (window.innerWidth > 991) {
        html.setAttribute('data-toggled', 'icon-overlay-close');
        sidebar?.addEventListener('mouseenter', handleMouseEnter);
        sidebar?.addEventListener('mouseleave', handleMouseLeave);
      } else {
        html.setAttribute('data-toggled', 'close');
        html.removeAttribute('data-icon-overlay');
        sidebar?.removeEventListener('mouseenter', handleMouseEnter);
        sidebar?.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Si forzamos el cierre, marcamos un flag global
    if (forceCloseSidebar) {
      html.setAttribute('data-force-close', 'true');
      html.setAttribute('data-toggled', 'close');
      sidebar?.removeEventListener('mouseenter', handleMouseEnter);
      sidebar?.removeEventListener('mouseleave', handleMouseLeave);
    }

    // Ejecutamos la función inicial
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (forceCloseSidebar) {
        // Al salir de la página de cursos, eliminamos el flag y disparamos un resize para reinicializar el menú
        html.removeAttribute('data-force-close');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      }
    };
  }, [forceCloseSidebar]);
};
