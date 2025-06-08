import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../scss/theme/_multiselect.scss';

interface Option {
  id: number | string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (newSelected: Option[]) => void;
  placeholder: string;
  onCancel: () => void;
  onGuardar: () => void;
}

interface DropdownPortalProps {
  children: React.ReactNode;
  position: { top: number; left: number; width: number };
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({ children, position }) => {
  return createPortal(
    <div
      className="multi-select__dropdown floating"
      style={{
        inset: 'auto auto 0px 0px',
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Selecciona...',
  onCancel,
  onGuardar,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropDirectionUp, setDropDirectionUp] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<null | {
    top: number;
    left: number;
    width: number;
  }>(null);

  const controlRef = useRef<HTMLDivElement>(null);

  const isSelected = (item: Option) => selected.some((s) => s.id === item.id);

  const toggleOption = (item: Option) => {
    const updated = isSelected(item)
      ? selected.filter((s) => s.id !== item.id)
      : [...selected, item];
    onChange(updated);
  };

  const filteredOptions = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdownElement = document.querySelector('.multi-select__dropdown.floating');

      if (
        controlRef.current &&
        !controlRef.current.contains(target) &&
        !(dropdownElement && dropdownElement.contains(target))
      ) {
        setShowDropdown(false);
      }
    };

    const handleScrollResize = (e: Event) => {
      const target = e.target as HTMLElement;
      if (dropdownPosition && controlRef.current && !controlRef.current.contains(target)) {
        const dropdownElement = document.querySelector('.multi-select__dropdown.floating');
        if (dropdownElement && dropdownElement.contains(target)) {
          return;
        }
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, []);

  useEffect(() => {
    if (showDropdown && controlRef.current) {
      const rect = controlRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 250;

      setDropDirectionUp(viewportHeight - rect.bottom < dropdownHeight);

      setTimeout(() => {
        const dropdownEl = dropdownRef.current;
        const height = dropdownEl?.offsetHeight || dropdownHeight;

        setDropdownPosition({
          top:
            viewportHeight - rect.bottom < height
              ? rect.top + window.scrollY - height - 4
              : rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }, 0);
    }
  }, [showDropdown]);

  return (
    <div className="container-multi-select">
      <div className="multi-select" ref={controlRef}>
        <div className="multi-select__control" onClick={() => setShowDropdown((prev) => !prev)}>
          <div className="multi-select__tags">
            {selected.map((item) => (
              <span className="multi-select__tag" key={item.id}>
                <button
                  type="button"
                  className="multi-select__tag-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(item);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                {item.name}
              </span>
            ))}
            {selected.length === 0 && (
              <span className="multi-select__placeholder">{placeholder}</span>
            )}
          </div>
          <span className="multi-select__arrow">▾</span>
        </div>
      </div>

      {showDropdown && dropdownPosition && (
        <DropdownPortal position={dropdownPosition}>
          <div ref={dropdownRef} className="multi-select__dropdown-container">
            {dropDirectionUp ? (
              <>
                <ul className="multi-select__options drop-up scroll-personalizado">
                  {filteredOptions.length === 0 ? (
                    <li className="multi-select__no-results">No hay resultados</li>
                  ) : (
                    filteredOptions.map((item) => (
                      <li
                        key={item.id}
                        className={`multi-select__option ${isSelected(item) ? 'selected' : ''}`}
                        onClick={() => toggleOption(item)}
                      >
                        <span className="multi-select__label">{item.name}</span>
                        <span className="multi-select__checkbox">
                          {isSelected(item) ? <i className="fa-solid fa-check"></i> : ''}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
                <div className="multi-select__search-wrapper drop-up-search">
                  <input
                    type="text"
                    className="form-control form-control-sm multi-select__search todo-mayuscula"
                    placeholder="Buscar..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="multi-select__search-wrapper">
                  <input
                    type="text"
                    className="form-control  multi-select__search"
                    placeholder="Buscar..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <ul className="multi-select__options">
                  {filteredOptions.length === 0 ? (
                    <li className="multi-select__no-results">No hay resultados</li>
                  ) : (
                    filteredOptions.map((item) => (
                      <li
                        key={item.id}
                        className={`multi-select__option ${isSelected(item) ? 'selected' : ''}`}
                        onClick={() => toggleOption(item)}
                      >
                        <span className="multi-select__label">{item.name}</span>
                        <span className="multi-select__checkbox">
                          {isSelected(item) ? <i className="fa-solid fa-check"></i> : ''}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
        </DropdownPortal>
      )}

      <div className="multi-select__footer">
        <button onClick={onCancel} className="btn btn-xs btn-outline-cancel me-2">
          Cancelar
        </button>
        <button onClick={onGuardar} className="btn btn-xs btn-primary">
          Guardar
        </button>
      </div>
    </div>
  );
};

export default MultiSelect;
