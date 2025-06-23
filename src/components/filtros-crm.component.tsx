import { useRef, useState, useEffect, CSSProperties, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface FiltrosCrmProps {
  tipoSeleccionado: string;
  valoresSeleccionados: any[];
  opcionesDeTipo: any[];
  opcionesDeValor: any[];
  onTipoChange: (nuevoTipo: string) => void;
  onDelete: () => void;
  onValoresChange: (nuevosValores: any[]) => void;
}

export const FiltrosCrmComponent = (props: FiltrosCrmProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreTagRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null); // <-- 1. Añade esta ref para el ícono

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const typeToggleRef = useRef<HTMLButtonElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const valueDropdownRef = useRef<HTMLDivElement>(null);
  const valueMenuRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(props.valoresSeleccionados.length);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeMenuStyles, setTypeMenuStyles] = useState<CSSProperties>({});
  const [typeSearchTerm, setTypeSearchTerm] = useState('');
  const [isValueOpen, setIsValueOpen] = useState(false);
  const [valueMenuStyles, setValueMenuStyles] = useState<CSSProperties>({});
  const [valueSearchTerm, setValueSearchTerm] = useState('');

  // --- Lógica de dropdowns y selección (sin cambios) ---
  useEffect(() => {
    if (isTypeOpen && typeToggleRef.current) {
      const rect = typeToggleRef.current.getBoundingClientRect();
      setTypeMenuStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: 320,
        maxHeight: 250,
        overflowY: 'auto',
        zIndex: 2000,
      });
    }
  }, [isTypeOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        typeMenuRef.current &&
        !typeMenuRef.current.contains(e.target as Node) &&
        typeToggleRef.current &&
        !typeToggleRef.current.contains(e.target as Node)
      ) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isValueOpen) return; // solo cuando esté abierto

    const handleClickAway = (e: MouseEvent) => {
      // Si haces clic fuera del menú Y fuera del wrapper ⇒ ciérralo
      if (
        valueMenuRef.current &&
        !valueMenuRef.current.contains(e.target as Node) &&
        valueDropdownRef.current &&
        !valueDropdownRef.current.contains(e.target as Node)
      ) {
        setIsValueOpen(false);
      }
    };

    // ----- ► fase de *captura*  ◄ -----
    document.addEventListener('mousedown', handleClickAway, true);

    return () => {
      document.removeEventListener('mousedown', handleClickAway, true);
    };
  }, [isValueOpen]);

  useEffect(() => {
    if (isValueOpen && valueDropdownRef.current) {
      const rect = valueDropdownRef.current.getBoundingClientRect();
      setValueMenuStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        maxHeight: 250,
        overflowY: 'auto',
        zIndex: 2000,
      });
    }
  }, [isValueOpen]);

  const handleValorSelect = (opcionSeleccionada: any) => {
    const yaExiste = props.valoresSeleccionados.find((v) => v.value === opcionSeleccionada.value);
    let nuevosValores;
    if (yaExiste) {
      nuevosValores = props.valoresSeleccionados.filter(
        (v) => v.value !== opcionSeleccionada.value
      );
    } else {
      nuevosValores = [...props.valoresSeleccionados, opcionSeleccionada];
    }
    props.onValoresChange(nuevosValores);
  };

  const filteredTypeOptions = props.opcionesDeTipo.filter((opcion) =>
    opcion.label.toLowerCase().includes(typeSearchTerm.toLowerCase())
  );

  const typeMenuPortal = isTypeOpen
    ? createPortal(
        <div ref={typeMenuRef} className="filtrosMenu" style={typeMenuStyles}>
          <div className="dropdown-filtros-search">
            <input
              placeholder="Buscar filtro..."
              className="form-control form-control-sm"
              type="text"
              value={typeSearchTerm}
              onChange={(e) => setTypeSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="dropdown-filtros-options">
            {filteredTypeOptions.map((opcion: any, i: number) => {
              const isSelected = opcion.label === props.tipoSeleccionado;
              return (
                <li
                  key={i}
                  className={`dropdown-filtros-option${isSelected ? ' selected' : ''}`}
                  onClick={() => {
                    props.onTipoChange(opcion.label);
                    setIsTypeOpen(false);
                  }}
                >
                  {opcion.avatar && (
                    <span className="dropdown-filtros-option-avatar">
                      <img src="/images/user-default.png" />
                    </span>
                  )}
                  <div className={`dropdown-filtros-option-name${isSelected ? ' selected' : ''}`}>
                    <p className="m-0 p-0">{opcion.label}</p>
                  </div>
                  <span className="dropdown-filtros-option-checkbox">
                    {isSelected && <i className="fa-solid fa-check"></i>}
                  </span>
                </li>
              );
            })}
            {filteredTypeOptions.length === 0 && (
              <li className="dropdown-filtros-option-empty">No se encontraron resultados</li>
            )}
          </ul>
        </div>,
        document.body
      )
    : null;

  const filteredValorOptions = props.opcionesDeValor.filter((opcion) =>
    opcion.label.toLowerCase().includes(valueSearchTerm.toLowerCase())
  );

  const valueMenuPortal = isValueOpen
    ? createPortal(
        <div
          ref={valueMenuRef}
          className="filtrosMenu"
          style={valueMenuStyles}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="dropdown-filtros-search">
            <input
              placeholder="Buscar ..."
              className="form-control form-control-sm"
              type="text"
              value={valueSearchTerm}
              onChange={(e) => setValueSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="dropdown-filtros-options">
            {filteredValorOptions.length > 0 ? (
              filteredValorOptions.map((opcion: any, i: number) => {
                const isSelected = props.valoresSeleccionados.some((v) => v.value === opcion.value);
                return (
                  <li
                    key={i}
                    className={`dropdown-filtros-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleValorSelect(opcion)}
                    style={
                      i === 0 && opcion.avatar
                        ? { borderBottom: '1px solid rgb(233, 236, 239)' }
                        : undefined
                    }
                  >
                    {opcion.avatar && (
                      <span className="dropdown-filtros-option-avatar">
                        <img src="/images/user-default.png" />
                      </span>
                    )}
                    <div className={`dropdown-filtros-option-name${isSelected ? ' selected' : ''}`}>
                      <p className="m-0 p-0">{opcion.label}</p>
                    </div>
                    <span className="dropdown-filtros-option-checkbox">
                      {isSelected && <i className="fa-solid fa-check"></i>}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="dropdown-filtros-option-empty">No se encontraron resultados</li>
            )}
          </ul>
        </div>,
        document.body
      )
    : null;

  useLayoutEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current || !iconRef.current || !moreTagRef.current) {
        return;
      }

      const containerWidth = containerRef.current.clientWidth - iconRef.current.offsetWidth - 38;
      let newVisibleCount = 0;
      let currentWidth = 0;

      const totalWidth = props.valoresSeleccionados.reduce((acc, _, i) => {
        const el = tagRefs.current[i];
        if (!el) return acc;
        const style = getComputedStyle(el);
        const margin = parseFloat(style.marginRight) || 0;
        return acc + el.offsetWidth + margin;
      }, 0);

      if (totalWidth <= containerWidth) {
        newVisibleCount = props.valoresSeleccionados.length;
      } else {
        const moreTagWidth = moreTagRef.current.offsetWidth + 8;

        for (let i = 0; i < props.valoresSeleccionados.length; i++) {
          const el = tagRefs.current[i];
          if (!el) continue;
          const tagWidth = el.offsetWidth + (parseFloat(getComputedStyle(el).marginRight) || 0);

          if (currentWidth + tagWidth > containerWidth - moreTagWidth) {
            break;
          }
          currentWidth += tagWidth;
          newVisibleCount++;
        }
      }

      // Al llamar a setVisibleCount, React ya evita un nuevo render si el valor es el mismo.
      // Quitando la condición `if (newVisibleCount !== visibleCount)` se soluciona el problema
      // de usar un valor de `visibleCount` "viejo" (stale closure) cuando la función
      // se ejecuta desde el `setTimeout`.
      setVisibleCount(newVisibleCount);
    };

    const ro = new ResizeObserver(calculateVisible);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Se elimina la llamada directa a `calculateVisible()` para evitar una doble ejecución.
    // El `setTimeout` da un pequeño margen para que el DOM se renderice completamente,
    // lo que hace el cálculo de anchos más fiable, especialmente al reabrir un modal.
    const timeout = setTimeout(calculateVisible, 50);

    return () => {
      ro.disconnect();
      clearTimeout(timeout);
    };
  }, [props.valoresSeleccionados, isValueOpen]);

  return (
    <div className="filtrosGroup">
      <div className="filtrosValue">
        <div className="filtrosDropdown" ref={typeDropdownRef} onClick={(e) => e.stopPropagation()}>
          <button
            ref={typeToggleRef}
            className="filtrosToggle"
            onClick={() => setIsTypeOpen((o) => !o)}
            type="button"
          >
            {props.tipoSeleccionado ? (
              <span className="filtrosToggleTitle">{props.tipoSeleccionado}</span>
            ) : (
              <span className="filtrosToggleTitle" style={{ color: 'rgb(141, 141, 141)' }}>
                Seleccionar filtro
              </span>
            )}
            <i className={`fa-solid fa-chevron-${isTypeOpen ? 'up' : 'down'} filtrosIcon`} />
          </button>
          {typeMenuPortal}
        </div>
        <div
          className="filtrosInputWrapper"
          ref={valueDropdownRef}
          onClick={() => {
            if (props.tipoSeleccionado) setIsValueOpen((o) => !o);
          }}
        >
          <div className="filtrosToggle" ref={containerRef}>
            {/* Contenedor visible que MUESTRA el resultado del cálculo */}
            <div className="filtrosInputContent">
              {props.valoresSeleccionados.map((tag, i) => (
                <div
                  key={tag.value}
                  ref={(el) => {
                    if (el) tagRefs.current[i] = el;
                  }}
                  className="filtroTag"
                  title={tag.label}
                  style={
                    i >= visibleCount
                      ? { position: 'absolute', zIndex: -1, visibility: 'hidden' }
                      : {}
                  }
                >
                  <span data-tooltip-id="tooltip-component" data-tooltip-content={tag.label}>
                    {tag.label}
                  </span>
                  <i
                    className="fa-solid fa-xmark filtroTag-close"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se abra el dropdown
                      handleValorSelect(tag);
                    }}
                  />
                </div>
              ))}

              <div
                className="filtroTag filtroMore"
                ref={moreTagRef}
                style={{
                  display: visibleCount < props.valoresSeleccionados.length ? 'flex' : 'none',
                }}
              >
                +{props.valoresSeleccionados.length - visibleCount}
              </div>
            </div>
            <i ref={iconRef} className="fa-solid fa-chevron-down filtrosIcon" />
          </div>
          {valueMenuPortal}
        </div>
        <button type="button" className="filtrosDelete" onClick={props.onDelete}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
};

export default FiltrosCrmComponent;
