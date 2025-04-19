import { useEffect } from "react";

const UseResponsiveHtml = () => {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        document.documentElement.setAttribute("data-toggled", "close");
      } else {
        document.documentElement.removeAttribute("data-toggled");
      }
    };

    // Ejecutar la función inmediatamente para aplicar el estado inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    
    // Limpieza del evento cuando el componente se desmonta
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null; // No renderiza nada, solo gestiona la lógica
};

export default UseResponsiveHtml;
