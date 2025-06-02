// MultiSelect.tsx
import React, { useEffect, useRef, useState } from 'react';
import '../scss/theme/_multiselect.scss';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Selecciona...',
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropDirectionUp, setDropDirectionUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  // Toggle selection of an option
  const toggleOption = (item: string) => {
    const updated = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];
    onChange(updated);
  };

  // Filter options based on query
  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        controlRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !controlRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine drop direction when opening
  useEffect(() => {
    if (showDropdown && controlRef.current) {
      const rect = controlRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 250; // mismo alto definido en CSS
      setDropDirectionUp(spaceBelow < dropdownHeight);
    }
  }, [showDropdown]);

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div
        className="multi-select__control"
        onClick={() => setShowDropdown((prev) => !prev)}
        ref={controlRef}
      >
        {selected.map((item) => (
          <span className="multi-select__tag" key={item}>
            {item}
            <button
              type="button"
              className="multi-select__tag-close"
              onClick={(e) => {
                e.stopPropagation();
                toggleOption(item);
              }}
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="multi-select__placeholder">{placeholder}</span>
        )}
        <span className="multi-select__arrow">▾</span>
      </div>

      {showDropdown && (
        <div
          className={`multi-select__dropdown ${dropDirectionUp ? 'up' : 'down'}`}
          style={{ maxHeight: '250px' }}
        >
          <div className="multi-select__search-wrapper">
            <input
              type="text"
              className="multi-select__search"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="multi-select__options">
            {filteredOptions.map((item) => (
              <li
                key={item}
                className={`multi-select__option ${
                  selected.includes(item) ? 'selected' : ''
                }`}
                onClick={() => toggleOption(item)}
              >
                <span className="multi-select__checkbox">
                  {selected.includes(item) ? '✓' : ''}
                </span>
                <span className="multi-select__label">{item}</span>
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="multi-select__no-results">No hay resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;